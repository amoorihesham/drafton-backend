import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../../../src/core/auth/auth.service.js";
import { IAuthRepository } from "../../../../src/core/auth/interfaces/auth.repository.interface.js";
import { IJwtService } from "../../../../src/core/auth/interfaces/services/jwt.service.interface.js";
import { IMailService } from "../../../../src/shared/services/mail/mail.service.interface.js";
import { IAuthConfig } from "../../../../src/core/auth/config/auth.config.interface.js";
import { UserEntity } from "../../../../src/core/auth/entities/user.entity.js";
import { AuthError } from "../../../../src/shared/errors/http.errors.js";
import {
  AUTH_ERROR_CODES,
  AUTH_MESSAGES,
} from "../../../../src/core/auth/constants/messages.js";
import { IOtpService } from "@/core/shared/interfaces/otp.service.interface.js";

// ─── Helpers ────────────────────────────────────────────────────

function makeUser(
  overrides: Partial<{
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    role: "provider" | "client";
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerificationOtp: string;
    emailVerificationOtpExpiry: Date;
    passwordResetOtp: string;
    passwordResetOtpExpiry: Date;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): UserEntity {
  return new UserEntity(
    overrides.id ?? "user-123",
    overrides.email ?? "amr@example.com",
    overrides.username ?? "amrhesham",
    overrides.passwordHash ?? "hashed-password",
    overrides.role ?? "provider",
    overrides.isActive ?? true,
    overrides.isEmailVerified ?? false,
    overrides.emailVerificationOtp ?? null!,
    overrides.emailVerificationOtpExpiry ?? null!,
    overrides.passwordResetOtp ?? null!,
    overrides.passwordResetOtpExpiry ?? null!,
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
  );
}

const makeRegisterDto = () => ({
  email: "amr@example.com",
  username: "amrhesham",
  password: "StrongPass123!",
});

// ─── Mocks ──────────────────────────────────────────────────────

function makeMocks() {
  const authRepository: IAuthRepository = {
    findUserByEmail: vi.fn().mockResolvedValue(null),
    findUserById: vi.fn(),
    findUserByUsername: vi.fn().mockResolvedValue(null),
    createUser: vi.fn().mockResolvedValue(makeUser()),
    saveEmailVerificationOtp: vi.fn().mockResolvedValue(undefined),
    deleteUser: vi.fn(),
    updateUser: vi.fn(),
    clearEmailVerificationOtp: vi.fn(),
    saveRefreshToken: vi.fn(),
  };

  const jwtService: IJwtService = {
    generateAccessToken: vi.fn().mockReturnValue("access-token"),
    generateRefreshToken: vi.fn().mockReturnValue("refresh-token"),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };

  const otpService: IOtpService = {
    generateOtp: vi.fn().mockReturnValue({
      otp: "123456",
      expiry: new Date(Date.now() + 3600000),
    }),
    verifyOtp: vi.fn(),
  };

  const mailService: IMailService = {
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn(),
  };

  const config: IAuthConfig = {
    saltRounds: 1, // low rounds for fast tests
    otpExpiryMinutes: 10,
    resetOtpExpiryMinutes: 60,
  };

  return { authRepository, jwtService, mailService, otpService, config };
}

// ─── Tests ──────────────────────────────────────────────────────

describe("AuthService.register", () => {
  let authService: AuthService;
  let mocks: ReturnType<typeof makeMocks>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = makeMocks();
    authService = new AuthService(
      mocks.authRepository,
      mocks.otpService,
      mocks.mailService,
      mocks.jwtService,
      mocks.config,
    );
  });

  // ─── Happy Path ───────────────────────────────────────────────

  it("should register a new user successfully", async () => {
    const result = await authService.register(makeRegisterDto());
    expect(result).toMatchObject({
      id: "user-123",
      email: "amr@example.com",
      username: "amrhesham",
      role: "provider",
      isEmailVerified: false,
    });
  });

  it("should check if email already exists", async () => {
    await authService.register(makeRegisterDto());
    expect(mocks.authRepository.findUserByEmail).toHaveBeenCalledWith(
      "amr@example.com",
    );
  });

  it("should call createUser with hashed password not plain text", async () => {
    await authService.register(makeRegisterDto());

    const createUserCall = vi.mocked(mocks.authRepository.createUser).mock
      .calls[0][0];
    expect(createUserCall.passwordHash).toBeDefined();
    expect(createUserCall.passwordHash).not.toBe("StrongPass123!");
  });
  it("should throw ConflictException if username already exists", async () => {
    vi.mocked(mocks.authRepository.findUserByUsername).mockResolvedValue(
      makeUser(),
    );

    await expect(authService.register(makeRegisterDto())).rejects.toThrow(
      AuthError,
    );
  });

  it("should throw with correct message and code when username is taken", async () => {
    vi.mocked(mocks.authRepository.findUserByUsername).mockResolvedValue(
      makeUser(),
    );

    await expect(authService.register(makeRegisterDto())).rejects.toMatchObject(
      {
        message: AUTH_MESSAGES.USERNAME_TAKEN,
        code: AUTH_ERROR_CODES.USERNAME_TAKEN,
        statusCode: 409,
      },
    );
  });

  it("should not call createUser if username already exists", async () => {
    vi.mocked(mocks.authRepository.findUserByUsername).mockResolvedValue(
      makeUser(),
    );

    await expect(authService.register(makeRegisterDto())).rejects.toThrow();
    expect(mocks.authRepository.createUser).not.toHaveBeenCalled();
  });

  it("should generate an OTP after creating user", async () => {
    await authService.register(makeRegisterDto());
    expect(mocks.otpService.generateOtp).toHaveBeenCalledOnce();
  });

  it("should save the OTP with correct userId", async () => {
    await authService.register(makeRegisterDto());
    expect(mocks.authRepository.saveEmailVerificationOtp).toHaveBeenCalledWith(
      "user-123",
      "123456",
      expect.any(Date),
    );
  });

  it("should set OTP expiry in the future", async () => {
    const before = new Date();
    await authService.register(makeRegisterDto());
    const after = new Date();

    const saveOtpCall = vi.mocked(mocks.authRepository.saveEmailVerificationOtp)
      .mock.calls[0];
    const expiry = saveOtpCall[2] as Date;

    expect(expiry.getTime()).toBeGreaterThan(before.getTime());
    expect(expiry.getTime()).toBeGreaterThan(after.getTime());
  });

  it("should send a verification email with correct email and otp", async () => {
    await authService.register(makeRegisterDto());
    expect(mocks.mailService.sendVerificationEmail).toHaveBeenCalledWith(
      "amr@example.com",
      "123456",
    );
  });

  // ─── Email Conflict ───────────────────────────────────────────

  it("should throw ConflictException if email already exists", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(
      makeUser(),
    );

    await expect(authService.register(makeRegisterDto())).rejects.toThrow(
      AuthError,
    );
  });

  it("should throw with correct message and code when email is taken", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(
      makeUser(),
    );

    await expect(authService.register(makeRegisterDto())).rejects.toMatchObject(
      {
        message: AUTH_MESSAGES.EMAIL_TAKEN,
        code: AUTH_ERROR_CODES.EMAIL_TAKEN,
        statusCode: 409,
      },
    );
  });

  it("should not call createUser if email already exists", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(
      makeUser(),
    );

    await expect(authService.register(makeRegisterDto())).rejects.toThrow();
    expect(mocks.authRepository.createUser).not.toHaveBeenCalled();
  });

  it("should not send verification email if email already exists", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(
      makeUser(),
    );

    await expect(authService.register(makeRegisterDto())).rejects.toThrow();
    expect(mocks.mailService.sendVerificationEmail).not.toHaveBeenCalled();
  });

  // ─── Operation Order ──────────────────────────────────────────

  it("should check email before creating user", async () => {
    const callOrder: string[] = [];

    vi.mocked(mocks.authRepository.findUserByEmail).mockImplementation(
      async () => {
        callOrder.push("findUserByEmail");
        return null;
      },
    );

    vi.mocked(mocks.authRepository.createUser).mockImplementation(async () => {
      callOrder.push("createUser");
      return makeUser();
    });

    await authService.register(makeRegisterDto());

    expect(callOrder.indexOf("findUserByEmail")).toBeLessThan(
      callOrder.indexOf("createUser"),
    );
  });

  it("should save OTP before sending email", async () => {
    const callOrder: string[] = [];

    vi.mocked(mocks.authRepository.saveEmailVerificationOtp).mockImplementation(
      async () => {
        callOrder.push("saveOtp");
      },
    );

    vi.mocked(mocks.mailService.sendVerificationEmail).mockImplementation(
      async () => {
        callOrder.push("sendEmail");
      },
    );

    await authService.register(makeRegisterDto());

    expect(callOrder.indexOf("saveOtp")).toBeLessThan(
      callOrder.indexOf("sendEmail"),
    );
  });
});

describe("AuthService.verifyEmail", () => {
  let authService: AuthService;
  let mocks: ReturnType<typeof makeMocks>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = makeMocks();
    authService = new AuthService(
      mocks.authRepository,
      mocks.otpService,
      mocks.mailService,
      mocks.jwtService,
      mocks.config,
    );
  });

  const validEmail = "amr@example.com";
  const validOtp = "123456";

  // ─── Happy Path ───────────────────────────────────────────────

  it("should verify email successfully", async () => {
    const user = makeUser({
      emailVerificationOtp: "123456",
      emailVerificationOtpExpiry: new Date(),
    });
    const updatedUser = makeUser({ isEmailVerified: true });

    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(user);
    vi.mocked(mocks.otpService.verifyOtp).mockReturnValue(true);
    vi.mocked(mocks.authRepository.updateUser).mockResolvedValue(updatedUser);

    const result = await authService.verifyEmail(validEmail, validOtp);

    expect(result).toMatchObject({
      id: "user-123",
      email: "amr@example.com",
      username: "amrhesham",
      role: "provider",
      isEmailVerified: true,
    });
  });

  it("should check if user exists by email", async () => {
    const user = makeUser({
      emailVerificationOtp: "123456",
      emailVerificationOtpExpiry: new Date(),
    });
    const updatedUser = makeUser({ isEmailVerified: true });

    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(user);
    vi.mocked(mocks.otpService.verifyOtp).mockReturnValue(true);
    vi.mocked(mocks.authRepository.updateUser).mockResolvedValue(updatedUser);

    await authService.verifyEmail(validEmail, validOtp);
    expect(mocks.authRepository.findUserByEmail).toHaveBeenCalledWith(
      validEmail,
    );
  });

  it("should call verifyOtp with correct params", async () => {
    const expiry = new Date();
    const user = makeUser({
      emailVerificationOtp: "valid-otp",
      emailVerificationOtpExpiry: expiry,
    });
    const updatedUser = makeUser({ isEmailVerified: true });

    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(user);
    vi.mocked(mocks.otpService.verifyOtp).mockReturnValue(true);
    vi.mocked(mocks.authRepository.updateUser).mockResolvedValue(updatedUser);

    await authService.verifyEmail(validEmail, "user-input-otp");

    expect(mocks.otpService.verifyOtp).toHaveBeenCalledWith({
      userOtp: "user-input-otp",
      otp: "valid-otp",
      expiry: expiry,
    });
  });

  it("should clear OTP before updating user", async () => {
    const user = makeUser({
      emailVerificationOtp: "123456",
      emailVerificationOtpExpiry: new Date(),
    });
    const updatedUser = makeUser({ isEmailVerified: true });

    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(user);
    vi.mocked(mocks.otpService.verifyOtp).mockReturnValue(true);
    vi.mocked(mocks.authRepository.updateUser).mockResolvedValue(updatedUser);

    const callOrder: string[] = [];

    vi.mocked(
      mocks.authRepository.clearEmailVerificationOtp,
    ).mockImplementation(async () => {
      callOrder.push("clearOtp");
    });
    vi.mocked(mocks.authRepository.updateUser).mockImplementation(async () => {
      callOrder.push("updateUser");
      return updatedUser;
    });

    await authService.verifyEmail(validEmail, validOtp);

    expect(mocks.authRepository.clearEmailVerificationOtp).toHaveBeenCalledWith(
      user.id,
    );
    expect(callOrder.indexOf("clearOtp")).toBeLessThan(
      callOrder.indexOf("updateUser"),
    );
  });

  it("should update user as verified", async () => {
    const user = makeUser({
      emailVerificationOtp: "123456",
      emailVerificationOtpExpiry: new Date(),
    });
    const updatedUser = makeUser({ isEmailVerified: true });

    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(user);
    vi.mocked(mocks.otpService.verifyOtp).mockReturnValue(true);
    vi.mocked(mocks.authRepository.updateUser).mockResolvedValue(updatedUser);

    await authService.verifyEmail(validEmail, validOtp);

    expect(mocks.authRepository.updateUser).toHaveBeenCalledWith(user.id, {
      isEmailVerified: true,
    });
  });

  // ─── Errors ───────────────────────────────────────────────────

  it("should throw error if user not found", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(null);

    await expect(
      authService.verifyEmail(validEmail, validOtp),
    ).rejects.toMatchObject({
      message: AUTH_MESSAGES.USER_NOT_FOUND,
      code: AUTH_ERROR_CODES.USER_NOT_FOUND,
      statusCode: 404,
    });
  });

  it("should throw error if user has no OTP", async () => {
    const user = makeUser({ emailVerificationOtp: null as any });
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(user);

    await expect(
      authService.verifyEmail(validEmail, validOtp),
    ).rejects.toMatchObject({
      message: AUTH_MESSAGES.OTP_NOT_FOUND,
      code: AUTH_ERROR_CODES.OTP_NOT_FOUND,
      statusCode: 404,
    });
  });

  it("should throw error if OTP is invalid", async () => {
    const user = makeUser({
      emailVerificationOtp: "123456",
      emailVerificationOtpExpiry: new Date(),
    });
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(user);
    vi.mocked(mocks.otpService.verifyOtp).mockReturnValue(false);

    await expect(
      authService.verifyEmail(validEmail, validOtp),
    ).rejects.toMatchObject({
      message: AUTH_MESSAGES.INVALID_OTP,
      code: AUTH_ERROR_CODES.INVALID_OTP,
      statusCode: 401,
    });
  });
});

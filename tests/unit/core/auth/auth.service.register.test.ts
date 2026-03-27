import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../../../src/core/auth/auth.service.js";
import { IAuthRepository } from "../../../../src/core/auth/interfaces/auth.repository.interface.js";
import { ITokenService } from "../../../../src/core/shared/interfaces/token.service.interface.js";
import { IMailService } from "../../../../src/core/shared/interfaces/mail.service.interface.js";
import { IAuthConfig } from "../../../../src/core/auth/config/auth.config.interface.js";
import { UserEntity } from "../../../../src/core/auth/entities/user.entity.js";
import { ConflictException } from "../../../../src/core/shared/errors/http.error.js";
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "../../../../src/core/auth/auth.constants.js";

// ─── Helpers ────────────────────────────────────────────────────

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return new UserEntity(
    "user-123",
    "amr@example.com",
    "amrhesham",
    "hashed-password",
    "provider",
    true,
    false,
    null!,
    null!,
    null!,
    null!,
    new Date(),
    new Date(),
    ...(Object.values(overrides) as []),
  );
}

const makeRegisterDto = () => ({
  email: "amr@example.com",
  username: "amrhesham",
  password: "StrongPass123!",
  role: "provider" as const,
});

// ─── Mocks ──────────────────────────────────────────────────────

function makeMocks() {
  const authRepository: IAuthRepository = {
    findUserByEmail: vi.fn().mockResolvedValue(null),
    findUserById: vi.fn(),
    createUser: vi.fn().mockResolvedValue(makeUser()),
    verifyEmail: vi.fn(),
    updatePassword: vi.fn(),
    saveEmailVerificationOtp: vi.fn().mockResolvedValue(undefined),
    savePasswordResetOtp: vi.fn(),
    saveRefreshToken: vi.fn(),
    findRefreshToken: vi.fn(),
    deleteRefreshToken: vi.fn(),
  };

  const tokenService: ITokenService = {
    generateAccessToken: vi.fn().mockReturnValue("access-token"),
    generateRefreshToken: vi.fn().mockReturnValue("refresh-token"),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    generateOpaqueToken: vi.fn().mockReturnValue("opaque-token"),
    generateOtp: vi.fn().mockReturnValue("123456"),
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

  return { authRepository, tokenService, mailService, config };
}

// ─── Tests ──────────────────────────────────────────────────────

describe("AuthService.register", () => {
  let authService: AuthService;
  let mocks: ReturnType<typeof makeMocks>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = makeMocks();
    authService = new AuthService(mocks.authRepository, mocks.tokenService, mocks.mailService, mocks.config);
  });

  // ─── Happy Path ───────────────────────────────────────────────

  it("should register a new user successfully", async () => {
    const result = await authService.register(makeRegisterDto());
    expect(result).toEqual({ message: AUTH_MESSAGES.REGISTER_SUCCESS });
  });

  it("should check if email already exists", async () => {
    await authService.register(makeRegisterDto());
    expect(mocks.authRepository.findUserByEmail).toHaveBeenCalledWith("amr@example.com");
  });

  it("should call createUser with hashed password not plain text", async () => {
    await authService.register(makeRegisterDto());

    const createUserCall = vi.mocked(mocks.authRepository.createUser).mock.calls[0][0];
    expect(createUserCall.passwordHash).toBeDefined();
    expect(createUserCall.passwordHash).not.toBe("StrongPass123!");
  });

  it("should generate an OTP after creating user", async () => {
    await authService.register(makeRegisterDto());
    expect(mocks.tokenService.generateOtp).toHaveBeenCalledOnce();
  });

  it("should save the OTP with correct userId", async () => {
    await authService.register(makeRegisterDto());
    expect(mocks.authRepository.saveEmailVerificationOtp).toHaveBeenCalledWith("user-123", "123456", expect.any(Date));
  });

  it("should set OTP expiry in the future", async () => {
    const before = new Date();
    await authService.register(makeRegisterDto());
    const after = new Date();

    const saveOtpCall = vi.mocked(mocks.authRepository.saveEmailVerificationOtp).mock.calls[0];
    const expiry = saveOtpCall[2] as Date;

    expect(expiry.getTime()).toBeGreaterThan(before.getTime());
    expect(expiry.getTime()).toBeGreaterThan(after.getTime());
  });

  it("should send a verification email with correct email and otp", async () => {
    await authService.register(makeRegisterDto());
    expect(mocks.mailService.sendVerificationEmail).toHaveBeenCalledWith("amr@example.com", "123456");
  });

  // ─── Email Conflict ───────────────────────────────────────────

  it("should throw ConflictException if email already exists", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(makeUser());

    await expect(authService.register(makeRegisterDto())).rejects.toThrow(ConflictException);
  });

  it("should throw with correct message and code when email is taken", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(makeUser());

    await expect(authService.register(makeRegisterDto())).rejects.toMatchObject({
      message: AUTH_MESSAGES.EMAIL_TAKEN,
      code: AUTH_ERROR_CODES.EMAIL_TAKEN,
      statusCode: 409,
    });
  });

  it("should not call createUser if email already exists", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(makeUser());

    await expect(authService.register(makeRegisterDto())).rejects.toThrow();
    expect(mocks.authRepository.createUser).not.toHaveBeenCalled();
  });

  it("should not send verification email if email already exists", async () => {
    vi.mocked(mocks.authRepository.findUserByEmail).mockResolvedValue(makeUser());

    await expect(authService.register(makeRegisterDto())).rejects.toThrow();
    expect(mocks.mailService.sendVerificationEmail).not.toHaveBeenCalled();
  });

  // ─── Operation Order ──────────────────────────────────────────

  it("should check email before creating user", async () => {
    const callOrder: string[] = [];

    vi.mocked(mocks.authRepository.findUserByEmail).mockImplementation(async () => {
      callOrder.push("findUserByEmail");
      return null;
    });

    vi.mocked(mocks.authRepository.createUser).mockImplementation(async () => {
      callOrder.push("createUser");
      return makeUser();
    });

    await authService.register(makeRegisterDto());

    expect(callOrder.indexOf("findUserByEmail")).toBeLessThan(callOrder.indexOf("createUser"));
  });

  it("should save OTP before sending email", async () => {
    const callOrder: string[] = [];

    vi.mocked(mocks.authRepository.saveEmailVerificationOtp).mockImplementation(async () => {
      callOrder.push("saveOtp");
    });

    vi.mocked(mocks.mailService.sendVerificationEmail).mockImplementation(async () => {
      callOrder.push("sendEmail");
    });

    await authService.register(makeRegisterDto());

    expect(callOrder.indexOf("saveOtp")).toBeLessThan(callOrder.indexOf("sendEmail"));
  });
});

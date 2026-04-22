import { User, UserResponseDto, UserSubscriptionResponseDto } from "@/types/shared/user";
import { IUserRepository } from "./interfaces/repository.interface";
import { UserWithSubscriptionType } from "./types";

export class UsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(userId: string) {
    const user = await this.userRepository.findById(userId);
    return this.toResponseDto(user);
  }
  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    return this.toResponseDto(user);
  }
  async findUserWithSubscription(userId: string) {
    const [user] = await this.userRepository.findUserWithSubscription(userId);
    return this.toUserSubscriptionResponseDto(user);
  }

  private toResponseDto(user: User | undefined): UserResponseDto | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toUserSubscriptionResponseDto(
    userA: UserWithSubscriptionType | undefined,
  ): UserSubscriptionResponseDto | null {
    if (!userA || !userA.plans || !userA.user_subscriptions) return null;
    return {
      user: this.toResponseDto(userA.users)!,
      subscription: {
        id: userA.user_subscriptions.id,
        status: userA.user_subscriptions.status,
        current_period_end: userA.user_subscriptions.current_period_end,
        current_period_start: userA.user_subscriptions.current_period_start,
        trial_ends_at: userA.user_subscriptions.trial_ends_at,
        created_at: userA.user_subscriptions.created_at,
        updated_at: userA.user_subscriptions.updated_at,
      },
      plan: {
        id: userA.plans?.id,
        name: userA.plans?.name,
        features: userA.plans?.features,
        is_active: userA.plans?.is_active,
        max_documents_per_day: userA.plans?.max_documents_per_day,
        price_monthly: userA.plans.price_monthly,
        price_yearly: userA.plans.price_yearly,
      },
    };
  }
}

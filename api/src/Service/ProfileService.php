<?php

namespace App\Service;

use App\Entity\User;
use App\Utils\Validator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

readonly class ProfileService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
        private Validator $customValidator,
    ) {
    }

    /**
     * @return array{success: bool, error?: string, message?: string}
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword, string $confirmPassword): array
    {
        // Validate current password
        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return ['success' => false, 'error' => 'Current password is incorrect'];
        }

        // Validate new password
        try {
            $this->customValidator->validatePassword($newPassword);
        } catch (\InvalidArgumentException $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }

        // Confirm password match
        if ($newPassword !== $confirmPassword) {
            return ['success' => false, 'error' => 'Passwords do not match'];
        }

        try {
            // Hash and set new password
            $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
            $user->setPassword($hashedPassword);

            $this->entityManager->flush();

            return ['success' => true, 'message' => 'Password changed successfully'];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to change password. Please try again.'];
        }
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return array{success: bool, error?: string, message?: string, user?: array<string, mixed>}
     */
    public function updateProfile(User $user, array $data): array
    {
        $originalEmail = $user->getEmail();
        $originalFullName = $user->getFullName();

        try {
            // Update full name if provided
            if (!empty($data['fullName'])) {
                $fullName = $data['fullName'];
                if (!\is_string($fullName)) {
                    return ['success' => false, 'error' => 'Full name must be a string'];
                }
                $validatedFullName = $this->customValidator->validateFullName($fullName);
                $user->setFullName($validatedFullName);
            }

            // Update email if provided
            if (!empty($data['email'])) {
                $email = $data['email'];
                if (!\is_string($email)) {
                    return ['success' => false, 'error' => 'Email must be a string'];
                }
                $validatedEmail = $this->customValidator->validateEmail($email);

                // Check if email is already taken by another user
                $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $validatedEmail]);
                if ($existingUser && $existingUser->getId() !== $user->getId()) {
                    return ['success' => false, 'error' => 'Email address is already in use'];
                }

                $user->setEmail($validatedEmail);
            }

            // Validate the user entity
            $errors = $this->validator->validate($user);
            if (\count($errors) > 0) {
                // Revert changes
                $user->setEmail($originalEmail);
                $user->setFullName($originalFullName);

                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }

                return ['success' => false, 'error' => implode(', ', $errorMessages)];
            }

            $this->entityManager->flush();

            return [
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'fullName' => $user->getFullName(),
                    'roles' => $user->getRoles(),
                    'isVerified' => $user->isVerified(),
                    'isActive' => $user->isActive(),
                ],
            ];
        } catch (\InvalidArgumentException $e) {
            // Revert changes
            $user->setEmail($originalEmail);
            $user->setFullName($originalFullName);

            return ['success' => false, 'error' => $e->getMessage()];
        } catch (\Exception $e) {
            // Revert changes
            $user->setEmail($originalEmail);
            $user->setFullName($originalFullName);

            return ['success' => false, 'error' => 'Failed to update profile. Please try again.'];
        }
    }
}

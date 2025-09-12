<?php

namespace App\Service;

use App\Entity\User;
use App\Utils\Validator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserService extends AbstractService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator,
        private readonly Validator $customValidator,
    ) {
    }

    /**
     * @return array{success: bool, error?: string, message?: string}
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword, string $confirmPassword): array
    {
        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return ['success' => false, 'error' => 'Current password is incorrect'];
        }

        try {
            $this->customValidator->validatePassword($newPassword);
        } catch (\InvalidArgumentException $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }

        if ($newPassword !== $confirmPassword) {
            return ['success' => false, 'error' => 'Passwords do not match'];
        }

        try {
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
            if (!empty($data['fullName'])) {
                $fullName = $data['fullName'];
                if (!\is_string($fullName)) {
                    return ['success' => false, 'error' => 'Full name must be a string'];
                }
                $validatedFullName = $this->customValidator->validateFullName($fullName);
                $user->setFullName($validatedFullName);
            }

            if (!empty($data['email'])) {
                $email = $data['email'];
                if (!\is_string($email)) {
                    return ['success' => false, 'error' => 'Email must be a string'];
                }
                $validatedEmail = $this->customValidator->validateEmail($email);

                $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $validatedEmail]);
                if ($existingUser && $existingUser->getId() !== $user->getId()) {
                    return ['success' => false, 'error' => 'Email address is already in use'];
                }

                $user->setEmail($validatedEmail);
            }

            $errors = $this->validator->validate($user);
            if (\count($errors) > 0) {
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
                'user' => $this->formatUserProfile($user),
            ];
        } catch (\InvalidArgumentException $e) {
            $user->setEmail($originalEmail);
            $user->setFullName($originalFullName);

            return ['success' => false, 'error' => $e->getMessage()];
        } catch (\Exception $e) {
            $user->setEmail($originalEmail);
            $user->setFullName($originalFullName);

            return ['success' => false, 'error' => 'Failed to update profile. Please try again.'];
        }
    }

    /**
     * Handle password change from request.
     *
     * @return array{success: bool, error?: string, message?: string}
     */
    public function handlePasswordChange(Request $request, User $user): array
    {
        $jsonResult = $this->extractJsonData($request);
        if (!$jsonResult['success']) {
            return $jsonResult;
        }

        $data = $jsonResult['data'] ?? [];

        $requiredFields = ['currentPassword', 'newPassword', 'confirmPassword'];
        $fieldValidation = $this->validateRequiredFields($data, $requiredFields);
        if (!$fieldValidation['success']) {
            return $fieldValidation;
        }

        $currentPassword = $this->castToString($data['currentPassword']);
        $newPassword = $this->castToString($data['newPassword']);
        $confirmPassword = $this->castToString($data['confirmPassword']);

        return $this->changePassword(
            $user,
            $currentPassword,
            $newPassword,
            $confirmPassword
        );
    }

    /**
     * Handle profile update from request.
     *
     * @return array{success: bool, error?: string, message?: string, user?: array<string, mixed>}
     */
    public function handleProfileUpdate(Request $request, User $user): array
    {
        $jsonResult = $this->extractJsonData($request);
        if (!$jsonResult['success']) {
            return $jsonResult;
        }

        $data = $jsonResult['data'] ?? [];

        return $this->updateProfile($user, $data);
    }

    /**
     * Format user data for API response.
     *
     * @return array<string, mixed>
     */
    public function formatUserProfile(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRoles(),
            'isVerified' => $user->isVerified(),
            'isActive' => $user->isActive(),
        ];
    }
}

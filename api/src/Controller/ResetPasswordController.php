<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use SymfonyCasts\Bundle\ResetPassword\Controller\ResetPasswordControllerTrait;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

#[Route('/api/auth')]
class ResetPasswordController extends AbstractController
{
    use ResetPasswordControllerTrait;

    public function __construct(
        private readonly ResetPasswordHelperInterface $resetPasswordHelper,
        private readonly EntityManagerInterface $entityManager,
        #[Autowire('%env(FRONTEND_URL)%')]
        private readonly string $frontendUrl,
    ) {
    }

    // ... existing methods ...

    /**
     * API endpoint to request a password reset.
     */
    #[Route('/forgot-password', name: 'api_auth_forgot', methods: ['POST'])]
    public function requestPasswordReset(Request $request, MailerInterface $mailer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!\is_array($data)) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data provided',
            ], 400);
        }

        $email = $data['email'] ?? '';
        if (!\is_string($email) || empty(trim($email))) {
            return $this->json([
                'success' => false,
                'error' => 'Email is required',
            ], 400);
        }

        $email = trim($email);
        if (!filter_var($email, \FILTER_VALIDATE_EMAIL)) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid email format',
            ], 400);
        }

        try {
            $this->processSendingPasswordResetEmail($email, $mailer);

            // Always return success to prevent email enumeration
            return $this->json([
                'success' => true,
                'message' => 'If an account with that email exists, a password reset link has been sent.',
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Failed to process password reset request. Please try again.',
            ], 500);
        }
    }

    /**
     * API endpoint to reset password with token.
     */
    #[Route('/reset-password', name: 'api_auth_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!\is_array($data)) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data provided',
            ], 400);
        }

        $token = $data['token'] ?? '';
        $newPassword = $data['password'] ?? '';
        $confirmPassword = $data['confirmPassword'] ?? '';

        if (!\is_string($token) || empty(trim($token))) {
            return $this->json([
                'success' => false,
                'error' => 'Reset token is required',
            ], 400);
        }

        if (!\is_string($newPassword) || empty(trim($newPassword))) {
            return $this->json([
                'success' => false,
                'error' => 'Password is required',
            ], 400);
        }

        if (mb_strlen($newPassword) < 6) {
            return $this->json([
                'success' => false,
                'error' => 'Password must be at least 6 characters long',
            ], 400);
        }

        if ($newPassword !== $confirmPassword) {
            return $this->json([
                'success' => false,
                'error' => 'Passwords do not match',
            ], 400);
        }

        try {
            /** @var User $user */
            $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid or expired reset token',
            ], 400);
        }

        try {
            // Remove the reset request
            $this->resetPasswordHelper->removeResetRequest($token);

            // Hash and set the new password
            $user->setPassword($passwordHasher->hashPassword($user, $newPassword));
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Password has been successfully reset',
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Failed to reset password. Please try again.',
            ], 500);
        }
    }

    /**
     * API endpoint to validate reset token.
     */
    #[Route('/validate-reset-token', name: 'api_auth_validate_reset_token', methods: ['POST'])]
    public function validateResetToken(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!\is_array($data)) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data provided',
            ], 400);
        }

        $token = $data['token'] ?? '';
        if (!\is_string($token) || empty(trim($token))) {
            return $this->json([
                'success' => false,
                'error' => 'Reset token is required',
            ], 400);
        }

        try {
            /** @var User $user */
            $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);

            return $this->json([
                'success' => true,
                'message' => 'Token is valid',
                'email' => $user->getEmail(), // Optionally return email for display
            ]);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid or expired reset token',
            ], 400);
        }
    }

    // ... existing methods for web interface ...

    private function processSendingPasswordResetEmail(string $emailFormData, MailerInterface $mailer): void
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy([
            'email' => $emailFormData,
        ]);

        // Don't reveal whether a user account was found or not
        if (!$user) {
            return;
        }

        try {
            $resetToken = $this->resetPasswordHelper->generateResetToken($user);
        } catch (ResetPasswordExceptionInterface $e) {
            return;
        }

        $resetUrl = $this->frontendUrl . '/reset-password?token=' . $resetToken->getToken();

        $email = (new TemplatedEmail())
            ->from(new Address('info@vishop.dev', 'Vehicle Shop'))
            ->to($user->getEmail())
            ->subject('Your password reset request')
            ->htmlTemplate('reset_password/email.html.twig')
            ->context([
                'resetToken' => $resetToken,
                'resetUrl' => $resetUrl,
                'user' => $user,
            ])
        ;

        $mailer->send($email);
    }
}

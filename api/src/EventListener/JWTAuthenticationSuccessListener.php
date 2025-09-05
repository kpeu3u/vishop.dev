<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class JWTAuthenticationSuccessListener implements EventSubscriberInterface
{
    public function __construct(
        private readonly RefreshTokenManagerInterface $refreshTokenManager,
        private readonly RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            Events::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccessResponse',
        ];
    }

    public function onAuthenticationSuccessResponse(AuthenticationSuccessEvent $event): void
    {
        $data = $event->getData();
        $user = $event->getUser();

        if (!$user instanceof User) {
            return;
        }

        // Add user data to the response
        $data['user'] = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRoles(),
        ];

        // Generate and add refresh token to the response
        try {
            // Use the new API - TTL in seconds (30 days = 30 * 24 * 60 * 60 seconds)
            $ttlInSeconds = 30 * 24 * 60 * 60; // 30 days

            $refreshToken = $this->refreshTokenGenerator->createForUserWithTtl(
                $user,
                $ttlInSeconds
            );

            $this->refreshTokenManager->save($refreshToken);
            $this->entityManager->flush();

            $data['refresh_token'] = $refreshToken->getRefreshToken();
        } catch (\Exception $e) {
            // Log the error but don't fail the login process
            error_log('Failed to generate refresh token: ' . $e->getMessage());
        }

        $event->setData($data);
    }
}

<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class JWTAuthenticationSuccessListener implements EventSubscriberInterface
{
    public function __construct(
        private readonly RefreshTokenManagerInterface $refreshTokenManager,
        private readonly EntityManagerInterface $entityManager
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
            $refreshToken = $this->refreshTokenManager->create();
            $refreshToken->setUsername($user->getUserIdentifier());
            $refreshToken->setRefreshToken();
            $refreshToken->setValid((new \DateTime())->modify('+1 month'));

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

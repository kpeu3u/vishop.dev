<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        // Check if user is active before authentication
        if (!$user->isActive()) {
            throw new CustomUserMessageAccountStatusException('Your account is not active. Please contact the administrator.');
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        // Additional checks after authentication can be added here
        // For example, checking if the account was deactivated after login
        if (!$user->isActive()) {
            throw new CustomUserMessageAccountStatusException('Your account has been deactivated.');
        }
    }
}

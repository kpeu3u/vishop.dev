<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

#[Route('/api/auth')]
class SecurityController extends AbstractController
{
    #[Route(path: '/login', name: 'api_login', methods: ['POST'])]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // This method is handled by the JSON login authenticator
        // The actual login logic is in the security configuration
        // This method will never be executed because JWT handles it

        return new JsonResponse([
            'message' => 'Login endpoint - should not reach here',
        ], 400);
    }

    #[Route(path: '/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}

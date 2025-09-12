<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/user')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class UserController extends AbstractController
{
    public function __construct(
        private readonly UserService $userService,
    ) {
    }

    #[Route('/profile', name: 'user_profile', methods: ['GET'])]
    public function getUserProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $userProfile = $this->userService->formatUserProfile($user);

        return $this->json($userProfile);
    }

    #[Route('/change-password', name: 'api_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $result = $this->userService->handlePasswordChange($request, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/update', name: 'api_update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $result = $this->userService->handleProfileUpdate($request, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }
}

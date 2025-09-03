<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\ProfileService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/user/profile')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class ProfileController extends AbstractController
{
    public function __construct(
        private readonly ProfileService $profileService,
    ) {
    }

    #[Route('/', name: 'user_profile', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getUserProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRoles(),
            'isVerified' => $user->isVerified(),
            'isActive' => $user->isActive(),
        ]);
    }

    #[Route('/change-password', name: 'api_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data provided',
            ], 400);
        }

        // Validate required fields
        $requiredFields = ['currentPassword', 'newPassword', 'confirmPassword'];
        foreach ($requiredFields as $field) {

            if (!isset($data[$field]) || !is_string($data[$field]) || empty(trim($data[$field]))) {
                return $this->json([
                    'success' => false,
                    'error' => ucfirst($field) . ' is required',
                ], 400);
            }
        }

        $result = $this->profileService->changePassword(
            $user,
            $data['currentPassword'],
            $data['newPassword'],
            $data['confirmPassword']
        );

        $statusCode = $result['success'] ? 200 : 400;

        return $this->json($result, $statusCode);
    }

    #[Route('/update', name: 'api_update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data provided',
            ], 400);
        }

        $result = $this->profileService->updateProfile($user, $data);

        $statusCode = $result['success'] ? 200 : 400;

        return $this->json($result, $statusCode);
    }
}

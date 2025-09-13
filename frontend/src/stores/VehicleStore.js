import { makeAutoObservable, runInAction } from 'mobx';
import { vehicleAPI } from '../services/api';

class VehicleStore {
    vehicles = [];
    followedVehicles = [];
    myVehicles = [];
    currentVehicle = null;
    isLoading = false;
    error = null;
    successMessage = null;
    validationErrors = {};
    
    // Pagination data
    pagination = {
        vehicles: null,
        followedVehicles: null,
        myVehicles: null
    };

    constructor() {
        makeAutoObservable(this);
    }

    // Actions
    async loadVehicles(filters = {}, page = 1, pageSize = 10) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const params = { ...filters, page, limit: pageSize };
            const response = await vehicleAPI.getVehicles(params);
            runInAction(() => {
                this.vehicles = response.vehicles;
                this.pagination.vehicles = response.pagination;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    async searchVehicles(searchTerm, page = 1, pageSize = 10) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await vehicleAPI.searchVehicles(searchTerm, page, pageSize);
            runInAction(() => {
                this.vehicles = response.vehicles;
                this.pagination.vehicles = response.pagination;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    async loadVehicle(id) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
            this.currentVehicle = null;
        });

        try {
            const response = await vehicleAPI.getVehicle(id);
            runInAction(() => {
                this.currentVehicle = response.vehicle;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    async createVehicle(vehicleData) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
            this.validationErrors = {};
            this.successMessage = null;
        });

        try {
            const response = await vehicleAPI.createVehicle(vehicleData);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Vehicle created successfully';
                    this.isLoading = false;
                });
                this.loadMyVehicles(); // Refresh merchant's vehicles
                return { success: true, vehicle: response.vehicle };
            }
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }

        runInAction(() => {
            this.isLoading = false;
        });
        return { success: false };
    }

    async updateVehicle(id, vehicleData) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
            this.validationErrors = {};
            this.successMessage = null;
        });

        try {
            const response = await vehicleAPI.updateVehicle(id, vehicleData);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Vehicle updated successfully';
                    if (this.currentVehicle && this.currentVehicle.id === id) {
                        this.currentVehicle = response.vehicle;
                    }
                    this.isLoading = false;
                });
                this.loadMyVehicles(); // Refresh merchant's vehicles
                return { success: true, vehicle: response.vehicle };
            }
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }

        runInAction(() => {
            this.isLoading = false;
        });
        return { success: false };
    }

    async deleteVehicle(id) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await vehicleAPI.deleteVehicle(id);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Vehicle deleted successfully';
                    // Remove from vehicles list if it's there
                    this.vehicles = this.vehicles.filter(p => p.id !== id);
                    this.isLoading = false;
                });
                this.loadMyVehicles(); // Refresh merchant's vehicles
                return { success: true };
            }
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }

        runInAction(() => {
            this.isLoading = false;
        });
        return { success: false };
    }

    async loadMyVehicles(page = 1, pageSize = 10) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await vehicleAPI.getMyVehicles(page, pageSize);
            runInAction(() => {
                this.myVehicles = response.vehicles;
                this.pagination.myVehicles = response.pagination;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    async followVehicle(id) {
        try {
            const response = await vehicleAPI.followVehicle(id);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Vehicle followed successfully';
                    // Update current vehicle if it's loaded
                    if (this.currentVehicle && this.currentVehicle.id === id) {
                        this.currentVehicle.isFollowed = true;
                        this.currentVehicle.followersCount = (this.currentVehicle.followersCount || 0) + 1;
                    }
                });
                return { success: true };
            }
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
            });
        }

        return { success: false };
    }

    async unfollowVehicle(id) {
        try {
            const response = await vehicleAPI.unfollowVehicle(id);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Vehicle unfollowed successfully';
                    // Update current vehicle if it's loaded
                    if (this.currentVehicle && this.currentVehicle.id === id) {
                        this.currentVehicle.isFollowed = false;
                        this.currentVehicle.followersCount = Math.max((this.currentVehicle.followersCount || 1) - 1, 0);
                    }
                    
                    // Remove from followed vehicles
                    this.followedVehicles = this.followedVehicles.filter(p => p.id !== id);
                });
                return { success: true };
            }
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
            });
        }

        return { success: false };
    }

    async loadFollowedVehicles(page = 1, pageSize = 10) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await vehicleAPI.getFollowedVehicles(page, pageSize);
            runInAction(() => {
                this.followedVehicles = response.vehicles;
                this.pagination.followedVehicles = response.pagination;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    // Helper methods
    handleError(error) {
        console.error('VehicleStore error:', error);

        if (error.response?.data?.errors) {
            this.validationErrors = error.response.data.errors;
            this.error = 'Please fix the validation errors';
        } else if (error.response?.data?.error) {
            this.error = error.response.data.error;
        } else if (error.response?.status === 401) {
            this.error = 'You are not authorized to perform this action';
        } else if (error.response?.status === 403) {
            this.error = 'You do not have permission to perform this action';
        } else if (error.response?.status >= 500) {
            this.error = 'Server error. Please try again later.';
        } else {
            this.error = error.message || 'An error occurred';
        }
    }

    clearMessages() {
        runInAction(() => {
            this.error = null;
            this.successMessage = null;
            this.validationErrors = {};
        });
    }

    clearCurrentVehicle() {
        runInAction(() => {
            this.currentVehicle = null;
        });
    }

    // Getters
    get availableVehicles() {
        return this.vehicles.filter(vehicle => vehicle.quantity > 0);
    }

    get vehiclesByType() {
        return this.vehicles.reduce((acc, vehicle) => {
            if (!acc[vehicle.type]) {
                acc[vehicle.type] = [];
            }
            acc[vehicle.type].push(vehicle);
            return acc;
        }, {});
    }
}

export default new VehicleStore();

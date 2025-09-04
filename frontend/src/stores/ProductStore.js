import { makeAutoObservable, runInAction } from 'mobx';
import { productAPI } from '../services/api';

class ProductStore {
    products = [];
    followedProducts = [];
    myProducts = [];
    currentProduct = null;
    isLoading = false;
    error = null;
    successMessage = null;
    validationErrors = {};

    constructor() {
        makeAutoObservable(this);
    }

    // Actions
    async loadProducts(filters = {}) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await productAPI.getProducts(filters);
            runInAction(() => {
                this.products = response.products;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    async searchProducts(searchTerm) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await productAPI.searchProducts(searchTerm);
            runInAction(() => {
                this.products = response.products;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    async loadProduct(id) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
            this.currentProduct = null;
        });

        try {
            const response = await productAPI.getProduct(id);
            runInAction(() => {
                this.currentProduct = response.product;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    async createProduct(productData) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
            this.validationErrors = {};
            this.successMessage = null;
        });

        try {
            const response = await productAPI.createProduct(productData);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Product created successfully';
                    this.isLoading = false;
                });
                this.loadMyProducts(); // Refresh merchant's products
                return { success: true, product: response.product };
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

    async updateProduct(id, productData) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
            this.validationErrors = {};
            this.successMessage = null;
        });

        try {
            const response = await productAPI.updateProduct(id, productData);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Product updated successfully';
                    if (this.currentProduct && this.currentProduct.id === id) {
                        this.currentProduct = response.product;
                    }
                    this.isLoading = false;
                });
                this.loadMyProducts(); // Refresh merchant's products
                return { success: true, product: response.product };
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

    async deleteProduct(id) {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await productAPI.deleteProduct(id);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Product deleted successfully';
                    // Remove from products list if it's there
                    this.products = this.products.filter(p => p.id !== id);
                    this.isLoading = false;
                });
                this.loadMyProducts(); // Refresh merchant's products
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

    async loadMyProducts() {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await productAPI.getMyProducts();
            runInAction(() => {
                this.myProducts = response.products;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.handleError(error);
                this.isLoading = false;
            });
        }
    }

    async followProduct(id) {
        try {
            const response = await productAPI.followProduct(id);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Product followed successfully';
                    // Update current product if it's loaded
                    if (this.currentProduct && this.currentProduct.id === id) {
                        this.currentProduct.isFollowed = true;
                        this.currentProduct.followersCount = (this.currentProduct.followersCount || 0) + 1;
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

    async unfollowProduct(id) {
        try {
            const response = await productAPI.unfollowProduct(id);
            if (response.success) {
                runInAction(() => {
                    this.successMessage = 'Product unfollowed successfully';
                    // Update current product if it's loaded
                    if (this.currentProduct && this.currentProduct.id === id) {
                        this.currentProduct.isFollowed = false;
                        this.currentProduct.followersCount = Math.max((this.currentProduct.followersCount || 1) - 1, 0);
                    }
                    
                    // Remove from followed products
                    this.followedProducts = this.followedProducts.filter(p => p.id !== id);
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

    async loadFollowedProducts() {
        runInAction(() => {
            this.isLoading = true;
            this.error = null;
        });

        try {
            const response = await productAPI.getFollowedProducts();
            runInAction(() => {
                this.followedProducts = response.products;
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
        console.error('ProductStore error:', error);

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

    clearCurrentProduct() {
        runInAction(() => {
            this.currentProduct = null;
        });
    }

    // Getters
    get availableProducts() {
        return this.products.filter(product => product.quantity > 0);
    }

    get productsByType() {
        return this.products.reduce((acc, product) => {
            if (!acc[product.type]) {
                acc[product.type] = [];
            }
            acc[product.type].push(product);
            return acc;
        }, {});
    }
}

export default new ProductStore();

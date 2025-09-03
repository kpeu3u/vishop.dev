import { makeAutoObservable } from 'mobx';
import { api } from '../services/api';

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
        this.isLoading = true;
        this.error = null;

        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
                    params.append(key, filters[key]);
                }
            });

            const response = await api.get(`/products${params.toString() ? `?${params.toString()}` : ''}`);
            this.products = response.products;
            this.isLoading = false;
        } catch (error) {
            this.handleError(error);
            this.isLoading = false;
        }
    }

    async searchProducts(searchTerm) {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await api.get(`/products/search?q=${encodeURIComponent(searchTerm)}`);
            this.products = response.products;
            this.isLoading = false;
        } catch (error) {
            this.handleError(error);
            this.isLoading = false;
        }
    }

    async loadProduct(id) {
        this.isLoading = true;
        this.error = null;
        this.currentProduct = null;

        try {
            const response = await api.get(`/products/${id}`);
            this.currentProduct = response.product;
            this.isLoading = false;
        } catch (error) {
            this.handleError(error);
            this.isLoading = false;
        }
    }

    async createProduct(productData) {
        this.isLoading = true;
        this.error = null;
        this.validationErrors = {};
        this.successMessage = null;

        try {
            const response = await api.post('/products', productData);
            if (response.success) {
                this.successMessage = 'Product created successfully';
                this.loadMyProducts(); // Refresh merchant's products
                return { success: true, product: response.product };
            }
        } catch (error) {
            this.handleError(error);
        }

        this.isLoading = false;
        return { success: false };
    }

    async updateProduct(id, productData) {
        this.isLoading = true;
        this.error = null;
        this.validationErrors = {};
        this.successMessage = null;

        try {
            const response = await api.put(`/products/${id}`, productData);
            if (response.success) {
                this.successMessage = 'Product updated successfully';
                this.loadMyProducts(); // Refresh merchant's products
                if (this.currentProduct && this.currentProduct.id === id) {
                    this.currentProduct = response.product;
                }
                return { success: true, product: response.product };
            }
        } catch (error) {
            this.handleError(error);
        }

        this.isLoading = false;
        return { success: false };
    }

    async deleteProduct(id) {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await api.delete(`/products/${id}`);
            if (response.success) {
                this.successMessage = 'Product deleted successfully';
                this.loadMyProducts(); // Refresh merchant's products
                // Remove from products list if it's there
                this.products = this.products.filter(p => p.id !== id);
                return { success: true };
            }
        } catch (error) {
            this.handleError(error);
        }

        this.isLoading = false;
        return { success: false };
    }

    async loadMyProducts() {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await api.get('/products/my-products');
            this.myProducts = response.products;
            this.isLoading = false;
        } catch (error) {
            this.handleError(error);
            this.isLoading = false;
        }
    }

    async followProduct(id) {
        try {
            const response = await api.post(`/products/${id}/follow`);
            if (response.success) {
                this.successMessage = 'Product followed successfully';
                // Update current product if it's loaded
                if (this.currentProduct && this.currentProduct.id === id) {
                    this.currentProduct.isFollowed = true;
                    this.currentProduct.followersCount += 1;
                }
                return { success: true };
            }
        } catch (error) {
            this.handleError(error);
        }

        return { success: false };
    }

    async unfollowProduct(id) {
        try {
            const response = await api.delete(`/products/${id}/unfollow`);
            if (response.success) {
                this.successMessage = 'Product unfollowed successfully';
                // Update current product if it's loaded
                if (this.currentProduct && this.currentProduct.id === id) {
                    this.currentProduct.isFollowed = false;
                    this.currentProduct.followersCount -= 1;
                }
                // Remove from followed products
                this.followedProducts = this.followedProducts.filter(p => p.id !== id);
                return { success: true };
            }
        } catch (error) {
            this.handleError(error);
        }

        return { success: false };
    }

    async loadFollowedProducts() {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await api.get('/products/followed');
            this.followedProducts = response.products;
            this.isLoading = false;
        } catch (error) {
            this.handleError(error);
            this.isLoading = false;
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
        this.error = null;
        this.successMessage = null;
        this.validationErrors = {};
    }

    clearCurrentProduct() {
        this.currentProduct = null;
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

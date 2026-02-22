import { api } from './api.js';
import type { ValidationResult } from './lib/index.js';

const productSchema: { parse: (input: unknown) => ValidationResult<unknown> } | null = null;

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  inStock: boolean;
  tags?: string[];
}

const productsGrid = document.getElementById('products-grid') as HTMLDivElement;
const errorState = document.getElementById('error-state') as HTMLDivElement;
const errorMessage = document.getElementById('error-message') as HTMLParagraphElement;
const retryBtn = document.getElementById('retry-btn') as HTMLButtonElement;

function renderProducts(products: Product[]): void {
  if (products.length === 0) {
    productsGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">No products yet</p>';
    productsGrid.hidden = false;
    return;
  }

  productsGrid.innerHTML = products.map(product => {
    const price = Number(product.price) || 0;
    const name = String(product.name || 'Unknown');
    const category = String(product.category || 'Unknown');
    const inStock = Boolean(product.inStock);
    const tags = Array.isArray(product.tags) ? product.tags : [];

    return `
    <div class="product-card">
      <h3 class="product-card__name">${escapeHtml(name)}</h3>
      <div class="product-card__price">$${price.toFixed(2)}</div>
      <span class="product-card__category">${escapeHtml(category)}</span>
      ${product.description ? `<p style="font-size: 0.875rem; color: #6b7280; margin: 0.5rem 0;">${escapeHtml(String(product.description))}</p>` : ''}
      <div class="product-card__stock ${inStock ? 'product-card__stock--in' : 'product-card__stock--out'}">
        ${inStock ? '✓ In Stock' : '✗ Out of Stock'}
      </div>
      ${tags.length > 0 ? `
        <div style="display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.5rem;">
          ${tags.map(tag => `<span style="font-size: 0.75rem; padding: 0.125rem 0.375rem; background: #f9fafb; border-radius: 0.25rem;">${escapeHtml(String(tag))}</span>`).join('')}
        </div>
      ` : ''}
      <div class="product-card__actions">
        <a href="add-product.html?id=${product.id}" class="btn btn--secondary product-card__btn">Edit</a>
        <button class="btn btn--secondary product-card__btn" data-product-id="${product.id}">Delete</button>
      </div>
    </div>
  `;
  }).join('');

  productsGrid.hidden = false;
  errorState.hidden = true;
}

function renderValidationErrors(errorCount: number): void {
  const errorCard = `
    <div class="product-card product-card--error">
      <div class="product-card__name">❌ Validation Errors</div>
      <div class="product-card__error">
        ${errorCount} product(s) failed validation. Check browser console for details.
      </div>
    </div>
  `;

  productsGrid.innerHTML += errorCard;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function fetchProducts(): Promise<void> {
  try {
    const data = await api.get<unknown[]>('/api/products');

    if (!productSchema) {
      console.warn('Product schema not implemented. Showing unvalidated data.');
      renderProducts(data as Product[]);
      return;
    }

    const validProducts: Product[] = [];
    let errorCount = 0;

    data.forEach((item, index) => {
      const result = productSchema.parse(item);

      if (result.success) {
        validProducts.push(result.data as Product);
      } else {
        errorCount++;
        console.error(`Product ${index} validation failed:`, result.errors);
      }
    });

    renderProducts(validProducts);

    if (errorCount > 0) {
      renderValidationErrors(errorCount);
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    errorMessage.textContent = message;
    errorState.hidden = false;
    productsGrid.hidden = true;
    console.error('Failed to fetch products:', error);
  }
}

async function deleteProduct(id: number): Promise<void> {
  if (!confirm('Delete this product?')) return;

  try {
    await api.delete(`/api/products/${id}`);
    fetchProducts();
  } catch (error) {
    alert('Failed to delete product');
    console.error(error);
  }
}

retryBtn?.addEventListener('click', fetchProducts);

productsGrid.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('button[data-product-id]')) {
    const productId = parseInt(target.dataset.productId || '', 10);
    if (!isNaN(productId)) {
      deleteProduct(productId);
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchProducts);
} else {
  fetchProducts();
}

import { api } from './api.js';
import { string, number, boolean, object, array } from './lib/index.js';

const productSchema = object({
  name: string().min(1).max(200),
  price: number().positive(),
  category: string().min(1),
  description: string().optional(),
  inStock: boolean(),
  tags: array(string()).optional()
});

const form = document.getElementById('product-form') as HTMLFormElement;
const pageTitle = document.getElementById('page-title') as HTMLHeadingElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const submitText = document.getElementById('submit-text') as HTMLSpanElement;
const formError = document.getElementById('form-error') as HTMLDivElement;

const inputs = {
  name: document.getElementById('name') as HTMLInputElement,
  price: document.getElementById('price') as HTMLInputElement,
  category: document.getElementById('category') as HTMLSelectElement,
  description: document.getElementById('description') as HTMLTextAreaElement,
  inStock: document.getElementById('inStock') as HTMLInputElement,
  tags: document.getElementById('tags') as HTMLInputElement
};

const errors = {
  name: document.getElementById('name-error') as HTMLDivElement,
  price: document.getElementById('price-error') as HTMLDivElement,
  category: document.getElementById('category-error') as HTMLDivElement,
  description: document.getElementById('description-error') as HTMLDivElement,
  tags: document.getElementById('tags-error') as HTMLDivElement
};

let editingProductId: number | null = null;

function getFormData(): Record<string, unknown> {
  const tagsValue = inputs.tags.value.trim();
  const tags = tagsValue ? tagsValue.split(',').map(t => t.trim()).filter(Boolean) : undefined;

  return {
    name: inputs.name.value.trim(),
    price: parseFloat(inputs.price.value),
    category: inputs.category.value,
    description: inputs.description.value.trim() || undefined,
    inStock: inputs.inStock.checked,
    tags
  };
}

function setFormData(data: Record<string, unknown>): void {
  inputs.name.value = String(data['name'] || '');
  inputs.price.value = String(data['price'] || '');
  inputs.category.value = String(data['category'] || '');
  inputs.description.value = String(data['description'] || '');
  inputs.inStock.checked = Boolean(data['inStock']);

  if (Array.isArray(data['tags']) && data['tags'].length > 0) {
    inputs.tags.value = data['tags'].join(', ');
  }
}

function clearErrors(): void {
  Object.values(errors).forEach(el => el.textContent = '');
  formError.hidden = true;
}

function showFieldError(field: keyof typeof errors, message: string): void {
  if (errors[field]) {
    errors[field].textContent = message;
  }
}

function validateForm(data: Record<string, unknown>): boolean {
  clearErrors();

  const result = productSchema.parse(data);

  if (!result.success) {
    result.errors.forEach((error: { path: string; message: string; expected: string; received: string }) => {
      const field = error.path as keyof typeof errors;
      if (field in errors) {
        showFieldError(field, error.message);
      } else {
        formError.textContent = `${error.path}: ${error.message}`;
        formError.hidden = false;
      }
    });
    console.error('Validation errors:', result.errors);
    return false;
  }

  return true;
}

async function saveProduct(data: Record<string, unknown>): Promise<void> {
  submitBtn.disabled = true;
  submitText.textContent = 'Saving...';

  try {
    if (editingProductId !== null) {
      await api.put(`/api/products/${editingProductId}`, data);
      alert('Product updated!');
    } else {
      await api.post('/api/products', data);
      alert('Product created!');
    }

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    formError.textContent = `Failed: ${message}`;
    formError.hidden = false;
    alert(`Error: ${message}`);
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = editingProductId !== null ? 'Update Product' : 'Add Product';
  }
}

async function loadProduct(id: number): Promise<void> {
  try {
    const product = await api.get<Record<string, unknown>>(`/api/products/${id}`);
    setFormData(product);
  } catch (error) {
    alert('Failed to load product');
    console.error(error);
  }
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();

  const formData = getFormData();

  if (!validateForm(formData)) {
    alert('Please fix validation errors');
    return;
  }

  await saveProduct(formData);
}

function initialize(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (productId) {
    editingProductId = parseInt(productId, 10);
    pageTitle.textContent = 'Edit Product';
    submitText.textContent = 'Update Product';
    loadProduct(editingProductId);
  }

  form.addEventListener('submit', handleSubmit);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

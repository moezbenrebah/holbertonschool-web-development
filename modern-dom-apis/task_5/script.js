const dialogDetails = document.getElementById('dialog-details');
const dialogDelete = document.getElementById('dialog-delete');

const btnDetails = document.querySelector('.btn-details');
const btnDelete = document.querySelector('.btn-delete');
const btnCloseDetails = document.getElementById('btn-close-details');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');

const productItem = document.querySelector('.product-item');

btnDetails.addEventListener('click', () => {
    dialogDetails.showModal();
});

btnCloseDetails.addEventListener('click', () => {
    dialogDetails.close();
});

dialogDetails.addEventListener('click', (e) => {
    if (e.target === dialogDetails) {
        dialogDetails.close();
    }
});

btnDelete.addEventListener('click', () => {
    dialogDelete.showModal();
});

btnCancelDelete.addEventListener('click', () => {
    dialogDelete.close();
});

btnConfirmDelete.addEventListener('click', () => {
    productItem.remove();
    dialogDelete.close();
});

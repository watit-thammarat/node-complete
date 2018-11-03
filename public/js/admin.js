const deleteProduct = btn => {
  const id = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  fetch(`/admin/products/${id}`, {
    method: 'DELETE',
    headers: { 'csrf-token': csrf }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      const article = btn.closest('article');
      article.parentNode.removeChild(article);
    })
    .catch(err => console.error(err));
};

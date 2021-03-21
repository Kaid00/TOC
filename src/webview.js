let element = document.getElementById('toc-item-linked');
element.addEventListener('click', () => {
  console.log('A header has been clicked');
});

// document.getElementById('toc-item-linked').addEventListener('click', () => {
//   //   const element = event.target;

//   //   // if clicked
//   //   if (element.className === 'toc-item-link') {
//   //     // get the slug
//   //     const slug = element.dataset.slug;
//   //     console.info('Clicked header slug: ', slug);
//   //   }

//   console.info('hello world');
// });

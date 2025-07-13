const handleSubmit = async () => {
  const form = new FormData();

  form.append('storeName', formData.storeName);
  form.append('storeSlug', formData.storeSlug);
  form.append('storeEmail', formData.storeEmail);
  form.append('storePhone', formData.storePhone);
  form.append('bannerType', formData.bannerType);
  form.append('storeNamePosition', formData.storeNamePosition);
  form.append('productsPerPage', String(formData.productsPerPage));
  form.append('hideEmail', String(formData.hideEmail));
  form.append('hidePhone', String(formData.hidePhone));
  form.append('hideAddress', String(formData.hideAddress));
  form.append('hideMap', String(formData.hideMap));
  form.append('hideAbout', String(formData.hideAbout));
  form.append('hidePolicy', String(formData.hidePolicy));
  form.append('description', formData.description);

  // Store Logo
  if (formData.storeLogo) {
    form.append('storeLogo', formData.storeLogo);
  }

  // Store Banner
  if (formData.storeBanner) {
    if (Array.isArray(formData.storeBanner)) {
      formData.storeBanner.forEach((file, i) =>
        form.append('storeBanner', file)
      );
    } else {
      form.append('storeBanner', formData.storeBanner);
    }
  }

  try {
    const response = await fetch('/api/vendor/settings', {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};

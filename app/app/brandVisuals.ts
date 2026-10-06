export const HOME_CAR_PHOTO = "https://images.unsplash.com/photo-1494976351278-20cf4a33d65b?auto=format&fit=crop&w=2400&q=82";

export const RADIO_INTERIOR_PHOTO = "https://images.pexels.com/photos/11845200/pexels-photo-11845200.jpeg?auto=compress&cs=tinysrgb&w=2200";

const brandPhotos: Record<string,string> = {
  honda: "https://unsplash.com/photos/zE2VGbJSYns/download?force=true",
  acura: "https://unsplash.com/photos/i0Pzu-PnWvU/download?force=true",

  jeep: "https://images.unsplash.com/photo-1640021042546-2a1b900f324b?auto=format&fit=crop&w=2200&q=82",
  dodge: "https://unsplash.com/photos/rcoDRb_2x90/download?force=true",
  chrysler: "https://unsplash.com/photos/bXcdBc-465k/download?force=true",

  ford: HOME_CAR_PHOTO,
  jaguar: "https://unsplash.com/photos/cqCrYkdwvdc/download?force=true",
  "land-rover": "https://images.unsplash.com/photo-1549632891-a0bea6d0355b?auto=format&fit=crop&w=2200&q=82",

  volkswagen: "https://images.unsplash.com/photo-1605475300127-0a31e8273bc2?auto=format&fit=crop&w=2200&q=82",
  audi: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=2200&q=82",
  seat: "https://unsplash.com/photos/hrYF98nawlA/download?force=true",
  skoda: "https://images.unsplash.com/photo-1605475300127-0a31e8273bc2?auto=format&fit=crop&w=2200&q=82",

  toyota: "https://images.unsplash.com/photo-1627008119017-f89d9704a799?auto=format&fit=crop&w=2200&q=82",
  suzuki: "https://images.pexels.com/photos/20498634/pexels-photo-20498634.jpeg?auto=compress&cs=tinysrgb&w=2200",
  nissan: "https://unsplash.com/photos/fb-Yqt_f9DQ/download?force=true",

  bmw: "https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?auto=format&fit=crop&w=2200&q=82",
  mercedes: "https://unsplash.com/photos/Sv0AxtA8YxI/download?force=true",
  porsche: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2200&q=82",

  fiat: "https://unsplash.com/photos/NLhjND4XsZA/download?force=true",
  "alfa-romeo": "https://unsplash.com/photos/pX5AzZFqFW4/download?force=true",
  lancia: "https://unsplash.com/photos/e3XEc1MgMbM/download?force=true",

  renault: "https://images.unsplash.com/photo-1594502225401-a9eab8b405dd?auto=format&fit=crop&w=2200&q=82",
  dacia: "https://unsplash.com/photos/1EFn8clp5Do/download?force=true",
  peugeot: "https://images.unsplash.com/photo-1594502225401-a9eab8b405dd?auto=format&fit=crop&w=2200&q=82",
  citroen: "https://unsplash.com/photos/dBVoG0RrFRU/download?force=true",

  iveco: "https://images.pexels.com/photos/15602197/pexels-photo-15602197.jpeg?auto=compress&cs=tinysrgb&w=2200",
  vauxhall: "https://unsplash.com/photos/1Fux_xS0je0/download?force=true",

  alpine: "https://images.pexels.com/photos/11845200/pexels-photo-11845200.jpeg?auto=compress&cs=tinysrgb&w=2200",
  becker: "https://images.pexels.com/photos/4480537/pexels-photo-4480537.jpeg?auto=compress&cs=tinysrgb&w=2200",
  blaupunkt: "https://images.pexels.com/photos/8266749/pexels-photo-8266749.jpeg?auto=compress&cs=tinysrgb&w=2200",
  bosch: "https://images.pexels.com/photos/5347842/pexels-photo-5347842.jpeg?auto=compress&cs=tinysrgb&w=2200",
  clarion: "https://unsplash.com/photos/zx0xUq--9IA/download?force=true",
  daiichi: "https://unsplash.com/photos/W6eWgrW-lbM/download?force=true",
  grundig: "https://unsplash.com/photos/eVXz9f8lXAM/download?force=true",
  sony: "https://unsplash.com/photos/I01mOmdHDyQ/download?force=true",
};

const radioManufacturerSlugs = new Set([
  "alpine",
  "becker",
  "blaupunkt",
  "bosch",
  "clarion",
  "daiichi",
  "grundig",
  "sony",
]);

const brandNameToSlug: Record<string,string> = {
  Acura:"acura", Honda:"honda", Jeep:"jeep", Dodge:"dodge", Chrysler:"chrysler", Ford:"ford", Jaguar:"jaguar", "Land Rover":"land-rover",
  Volkswagen:"volkswagen", Audi:"audi", SEAT:"seat", "Škoda":"skoda", Toyota:"toyota", Lexus:"toyota", Suzuki:"suzuki", Nissan:"nissan",
  BMW:"bmw", "Mercedes-Benz":"mercedes", Porsche:"porsche", Fiat:"fiat", "Alfa Romeo":"alfa-romeo", Lancia:"lancia", Renault:"renault", Dacia:"dacia",
  Peugeot:"peugeot", "Citroën":"citroen", Iveco:"iveco", "Vauxhall / Opel":"vauxhall"
};

export function brandPhotoForSlug(slug:string){
  return brandPhotos[slug] || RADIO_INTERIOR_PHOTO;
}

export function brandPhotoForName(name:string){
  const slug=brandNameToSlug[name];
  return slug ? brandPhotoForSlug(slug) : RADIO_INTERIOR_PHOTO;
}

export function isRadioManufacturerSlug(slug:string){
  return radioManufacturerSlugs.has(slug);
}

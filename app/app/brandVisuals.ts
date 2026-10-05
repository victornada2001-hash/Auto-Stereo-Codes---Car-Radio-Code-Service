export const HOME_CAR_PHOTO = "https://unsplash.com/photos/c7Gay8ttJS0/download?force=true";

export const RADIO_INTERIOR_PHOTO = "https://images.unsplash.com/photo-1773065558261-792b9d779fb1?auto=format&fit=crop&fm=jpg&q=78&w=2200";

const brandPhotos: Record<string,string> = {
  acura: "https://unsplash.com/photos/zE2VGbJSYns/download?force=true",
  honda: "https://unsplash.com/photos/zE2VGbJSYns/download?force=true",

  jeep: "https://images.unsplash.com/photo-1640021042546-2a1b900f324b?auto=format&fit=crop&w=2200&q=82",
  dodge: "https://unsplash.com/photos/rcoDRb_2x90/download?force=true",
  chrysler: "https://unsplash.com/photos/rcoDRb_2x90/download?force=true",

  ford: "https://unsplash.com/photos/c7Gay8ttJS0/download?force=true",
  jaguar: "https://unsplash.com/photos/c7Gay8ttJS0/download?force=true",
  "land-rover": "https://images.unsplash.com/photo-1640021042546-2a1b900f324b?auto=format&fit=crop&w=2200&q=82",

  volkswagen: "https://images.unsplash.com/photo-1605475300127-0a31e8273bc2?auto=format&fit=crop&w=2200&q=82",
  audi: "https://images.unsplash.com/photo-1605475300127-0a31e8273bc2?auto=format&fit=crop&w=2200&q=82",
  seat: "https://images.unsplash.com/photo-1605475300127-0a31e8273bc2?auto=format&fit=crop&w=2200&q=82",
  skoda: "https://images.unsplash.com/photo-1605475300127-0a31e8273bc2?auto=format&fit=crop&w=2200&q=82",

  toyota: "https://images.unsplash.com/photo-1627008119017-f89d9704a799?auto=format&fit=crop&w=2200&q=82",
  suzuki: "https://images.unsplash.com/photo-1627008119017-f89d9704a799?auto=format&fit=crop&w=2200&q=82",
  nissan: "https://unsplash.com/photos/fb-Yqt_f9DQ/download?force=true",

  bmw: "https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?auto=format&fit=crop&w=2200&q=82",
  mercedes: "https://unsplash.com/photos/Sv0AxtA8YxI/download?force=true",
  porsche: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2200&q=82",

  fiat: "https://unsplash.com/photos/NLhjND4XsZA/download?force=true",
  "alfa-romeo": "https://unsplash.com/photos/NLhjND4XsZA/download?force=true",
  lancia: "https://unsplash.com/photos/NLhjND4XsZA/download?force=true",

  renault: "https://images.unsplash.com/photo-1594502225401-a9eab8b405dd?auto=format&fit=crop&w=2200&q=82",
  dacia: "https://images.unsplash.com/photo-1594502225401-a9eab8b405dd?auto=format&fit=crop&w=2200&q=82",
  peugeot: "https://images.unsplash.com/photo-1594502225401-a9eab8b405dd?auto=format&fit=crop&w=2200&q=82",
  citroen: "https://images.unsplash.com/photo-1594502225401-a9eab8b405dd?auto=format&fit=crop&w=2200&q=82",

  iveco: HOME_CAR_PHOTO,
  vauxhall: HOME_CAR_PHOTO,

  alpine: RADIO_INTERIOR_PHOTO,
  becker: RADIO_INTERIOR_PHOTO,
  blaupunkt: RADIO_INTERIOR_PHOTO,
  bosch: RADIO_INTERIOR_PHOTO,
  clarion: RADIO_INTERIOR_PHOTO,
  daiichi: RADIO_INTERIOR_PHOTO,
  grundig: RADIO_INTERIOR_PHOTO,
  sony: RADIO_INTERIOR_PHOTO,
};

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

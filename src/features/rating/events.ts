export function ratingChanged() {
  window.dispatchEvent(new Event("kodzuke-rating-change"));
}

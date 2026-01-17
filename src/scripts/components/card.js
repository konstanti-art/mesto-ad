const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  likeCountElement.textContent = data.likes.length;
  const isLiked = data.likes.some((like) => like._id === currentId);

  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(data._id, cardElement));
  }

  if (data.owner._id !== currentId) {
    deleteButton.remove();
  }
  
  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};

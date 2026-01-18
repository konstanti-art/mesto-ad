/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { getCardList, getUserInfo, setUserInfo, updateUserAvatar, addNewCard, deleteCard, changeLikeCardStatus } from "./components/api.js";


let currentId;

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileFormButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardFormButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarFormButton = avatarForm.querySelector(".popup__button");

const deleteCardModalWindow = document.querySelector(".popup_type_remove-card");
const deleteCardForm = deleteCardModalWindow.querySelector(".popup__form");
const deleteCardFormButton = deleteCardForm.querySelector(".popup__button");

// Элементы статистики
const logo = document.querySelector('.header__logo');
const infoPopup = document.querySelector('.popup_type_info');
const infoTitle = infoPopup.querySelector('.popup__title');
const infoContainer = infoPopup.querySelector('.popup__info'); // Контейнер <dl>
const popularCardsList = infoPopup.querySelector('.popup__list'); // Контейнер <ul>
const popularCardsTitle = infoPopup.querySelector('.popup__text'); // Заголовок списка

// Шаблоны
const infoDefinitionTemplate = document.querySelector('#popup-info-definition-template').content;
const popularItemTemplate = document.querySelector('#popup-info-user-preview-template').content;


const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, profileFormButton);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      // Код отвечающий за обновление данных на странице
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, profileFormButton);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, avatarFormButton);

  updateUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      // Код отвечающий за обновление аватара на странице
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, avatarFormButton);
    });
  
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, cardFormButton, 'Создать', 'Создание...');
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      // Код отвечающий за добавление новой карточки на страницу
      placesWrap.prepend(
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: hendelLikeCard,
          onDeleteCard: hendelDeleteCard,
        }, currentId)
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, cardFormButton, 'Создать', 'Создание...');
    });
};

const hendelDeleteCard = (cardId, cardElement) => {
  openModalWindow(deleteCardModalWindow);
  const handleDeleteCardFormSubmit = (evt) => {
    evt.preventDefault();
    renderLoading(true, deleteCardFormButton, 'Да', 'Удаление...');
    deleteCard(cardId)
      .then(() => {
        // Код отвечающий за удаление карточки со страницы
        cardElement.remove();
        closeModalWindow(deleteCardModalWindow);
        deleteCardForm.removeEventListener("submit", handleDeleteCardFormSubmit);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        renderLoading(false, deleteCardFormButton, 'Да', 'Удаление...');
      });
  };
  deleteCardForm.addEventListener("submit", handleDeleteCardFormSubmit);
};

const hendelLikeCard = (cardId, cardElement) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      // Код отвечающий за обновление состояния лайка на странице
      likeButton.classList.toggle("card__like-button_is-active");
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderLoading = (isLoading, button, defaultButtonText = 'Сохранить', loadingText = 'Сохранение...') => {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = defaultButtonText;
  }
};

const hendleLogoClick = () => {
  getCardList()
    .then((cards) => {
      // Очистка предыдущей статистики
      infoContainer.innerHTML = '';
      popularCardsList.innerHTML = '';

      // Подсчет статистики пользователей
      const uniqueUserIds = new Set();
      const userActivity = {};
      let totalLikes = 0;

      cards.forEach((card) => {
        uniqueUserIds.add(card.owner._id);
        totalLikes += card.likes.length;
        card.likes.forEach((user) => {
          uniqueUserIds.add(user._id);
          if (!userActivity[user._id]) {
            userActivity[user._id]  = { name: user.name, likesGiven: 0 };
          }
          userActivity[user._id].likesGiven ++;
        });
      });
      
      let maxLikes = 0;
      let champion = 'Нет данных';

      Object.values(userActivity).forEach((user) => {
        if (user.likesGiven > maxLikes) {
          maxLikes = user.likesGiven;
          champion = user.name;
        }
      });

      // Определение и отображение статистики пользователей
      infoTitle.textContent = 'Статистика карточек';

      const definitions = [
        { term: 'Всего пользователей:', description: uniqueUserIds.size.toString() },
        { term: 'Всего лайков:', description: totalLikes.toString() },
        { term: 'Максимально лайков от одного:', description: maxLikes.toString() },
        { term: 'Чемпионы лайков:', description: champion }
      ];

      definitions.forEach(({ term, description }) => {
        const infoItem = infoDefinitionTemplate.cloneNode(true);
        infoItem.querySelector('.popup__info-term').textContent = term;
        infoItem.querySelector('.popup__info-description').textContent = description;
        infoContainer.appendChild(infoItem);
      });

      // Определение и отображение популярных карточек
      const sortedCards = cards.slice().sort((a, b) => b.likes.length - a.likes.length);
      const topCards = sortedCards.slice(0, 3);

      popularCardsTitle.textContent = 'Популярные карточки';

      topCards.forEach((card) => {
        const popularItem = popularItemTemplate.querySelector('.popup__list-item').cloneNode(true);
        popularItem.textContent = card.name;
        popularCardsList.appendChild(popularItem);
      });

      openModalWindow(infoPopup);
    })
    .catch((err) => {
      console.log(err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
logo.addEventListener('click', hendleLogoClick);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings);


Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
      // Код отвечающий за отрисовку полученных данных
    currentId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    cards.forEach((data) => {
      placesWrap.append(
        createCardElement(data, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: hendelLikeCard,
          onDeleteCard: hendelDeleteCard,
        }, currentId)
      );
    });
  })
  .catch((err) => {
    console.log(err); // В случае возникновения ошибки выводим её в консоль
  });

  
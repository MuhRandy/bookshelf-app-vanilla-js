const storageKey = "STORAGE_KEY";
const homeNavButtons = document.getElementsByClassName("home-button");
const addBookButtons = document.getElementsByClassName("add-book-button");
const unfinishedBookshelfButtons = document.getElementsByClassName(
  "unfinished-bookshelf-button"
);
const finishedBookshelfButtons = document.getElementsByClassName(
  "finished-bookshelf-button"
);
const menuMobileButton = document.getElementById("open-menu-mobile");
const mobileNavbar = document.getElementById("mobile-navbar");
const mobileNavbarContainer = document.getElementById(
  "mobile-navbar-container"
);
const addEditBookTitle = document.getElementById("add-edit-book-title");
const cancelBookButton = document.getElementById("cancel-book-form-button");
const bookForm = document.getElementById("book-form");
const titleLabel = document.getElementById("title-label");
const titleInput = document.getElementById("title");
const authorLabel = document.getElementById("author-label");
const authorInput = document.getElementById("author");
const yearLabel = document.getElementById("year-label");
const yearInput = document.getElementById("year");
const isCompleted = document.getElementById("is-completed");
const submitBookButton = document.getElementById("submit-book-form-button");
const searchInput = document.getElementById("search-book");
const finishedBookshelf = document.getElementById("finished-bookshelf");
const unfinishedBookshelf = document.getElementById("unfinished-bookshelf");

let submitFormHandler;

floatingInputLabel(titleInput, titleLabel, "Judul");
floatingInputLabel(authorInput, authorLabel, "Penulis");
floatingInputLabel(yearInput, yearLabel, "Tahun");

window.addEventListener("load", function () {
  if (checkForStorage) {
    alert(
      "Jika ingin generate Buku, Anda bisa ketikkan \\generateBuku pada pencarian judul."
    );
    renderBookList();
  } else {
    alert("Browser yang Anda gunakan tidak mendukung Web Storage");
  }
});

loopingAddEventListenerButtons(unfinishedBookshelfButtons, function () {
  finishedBookshelf.classList.remove("card", "bookshelf");
  unfinishedBookshelf.classList.add("card", "bookshelf");
});

loopingAddEventListenerButtons(finishedBookshelfButtons, function () {
  unfinishedBookshelf.classList.remove("card", "bookshelf");
  finishedBookshelf.classList.add("card", "bookshelf");
});

loopingAddEventListenerButtons(homeNavButtons, () => {
  unfinishedBookshelf.classList.add("card", "bookshelf");
  finishedBookshelf.classList.add("card", "bookshelf");
});

loopingAddEventListenerButtons(addBookButtons, function () {
  submitBookButton.innerText = "Tambah";
  addEditBookTitle.innerText = "Tambah Buku";
  submitFormHandler = submitAddBookHandler;
  toggleShowAddEditBook();
});

menuMobileButton.addEventListener("click", function () {
  mobileNavbar.classList.toggle("show-navbar-menu");
  mobileNavbarContainer.classList.toggle("show-navbar-menu-container");
});

mobileNavbar.addEventListener("click", function () {
  this.classList.toggle("show-navbar-menu");
  mobileNavbarContainer.classList.toggle("show-navbar-menu-container");
});

bookForm.addEventListener("submit", function (event) {
  event.preventDefault();

  submitFormHandler();
  resetAndToggleShowAddBook();
  renderBookList();
});

cancelBookButton.addEventListener("click", function () {
  resetAndToggleShowAddBook();
});

searchInput.addEventListener("input", function (event) {
  const searchValue = event.target.value;

  if (searchValue.length > 0) {
    if (searchValue === `\\generateBuku`) {
      if (
        confirm(
          "Buku yang sudah anda masukkan sebelumnya akan digantikan. Anda yakin ingin generate buku?"
        )
      ) {
        generateFakeData();
      }
      searchInput.value = "";
      renderBookList();
    } else {
      renderSearchBookList(searchValue);
    }
  } else {
    renderBookList();
  }
});

// Functions
function floatingInputLabel(inputElement, labelElement, placeholder) {
  labelElement.classList.add("hide-label");

  inputElement.addEventListener("focus", function () {
    labelElement.classList.add("show-label");
    this.removeAttribute("placeholder");
  });

  inputElement.addEventListener("blur", function () {
    if (this.value.length === 0) {
      labelElement.classList.remove("show-label");
      this.setAttribute("placeholder", placeholder);
      this.classList.remove("input-has-value");
    } else {
      this.classList.add("input-has-value");
    }
  });
}

function unfocusAllInput() {
  titleInput.focus();
  authorInput.focus();
  yearInput.focus();

  titleInput.blur();
  authorInput.blur();
  yearInput.blur();
}

function checkForStorage() {
  return typeof Storage !== "undefined";
}

function putBookList(data) {
  if (checkForStorage()) {
    let bookData = [];
    if (localStorage.getItem(storageKey) !== null) {
      bookData = JSON.parse(localStorage.getItem(storageKey));
    }
    bookData.unshift(data);
    if (bookData.length > 5) {
      bookData.pop();
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData));
  }
}

function overideBookList(bookData) {
  if (checkForStorage()) {
    localStorage.setItem(storageKey, JSON.stringify(bookData));
  }
}

function getBookList() {
  if (checkForStorage()) {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } else {
    return [];
  }
}

function renderBookList() {
  const bookData = getBookList();
  const unfinishedBookList = document.getElementById("unfinished-book-content");
  const finishedBookList = document.getElementById("finished-book-content");
  const countFinishedBook = countFinishedBookList(bookData);
  const countUnfinishedBook = countUnfinishedBookList(bookData);

  finishedBookList.innerHTML = "";
  unfinishedBookList.innerHTML = "";
  finishedBookList.classList.remove("more-than-one-book");
  unfinishedBookList.classList.remove("more-than-one-book");

  if (countUnfinishedBook === 0) {
    generateWhenNoBook(
      unfinishedBookList,
      "Tidak ada buku yang belum selesai dibaca"
    );
  }

  if (countFinishedBook === 0) {
    generateWhenNoBook(finishedBookList, "Tidak ada buku yang selesai dibaca");
  }

  for (let book of bookData) {
    if (book.isCompleted) {
      finishedBookList.appendChild(generateBook(book));
      if (countFinishedBook > 1) {
        finishedBookList.classList.add("more-than-one-book");
      }
    } else {
      unfinishedBookList.appendChild(generateBook(book));
      if (countUnfinishedBook > 1) {
        unfinishedBookList.classList.add("more-than-one-book");
      }
    }
  }
}

function renderSearchBookList(searchValue) {
  const bookData = getBookList();
  const unfinishedBookList = document.getElementById("unfinished-book-content");
  const finishedBookList = document.getElementById("finished-book-content");
  const regex = RegExp(`${searchValue}+`, "i");
  let countFinishedBookSearch = 0;
  let countUnfinishedBookSearch = 0;

  finishedBookList.innerHTML = "";
  unfinishedBookList.innerHTML = "";
  finishedBookList.classList.remove("more-than-one-book");
  unfinishedBookList.classList.remove("more-than-one-book");

  for (let book of bookData) {
    if (regex.test(book.title)) {
      if (book.isCompleted) {
        finishedBookList.appendChild(generateBook(book));
        countFinishedBookSearch += 1;
        if (countFinishedBookSearch > 1) {
          finishedBookList.classList.add("more-than-one-book");
        }
      } else {
        unfinishedBookList.appendChild(generateBook(book));
        countUnfinishedBookSearch += 1;
        if (countUnfinishedBookSearch > 1) {
          unfinishedBookList.classList.add("more-than-one-book");
        }
      }
    }
  }

  if (countUnfinishedBookSearch === 0) {
    generateWhenNoBook(unfinishedBookList, "Tidak ada buku yang sesuai");
  }

  if (countFinishedBookSearch === 0) {
    generateWhenNoBook(finishedBookList, "Tidak ada buku yang sesuai");
  }
}

function countFinishedBookList(bookData) {
  let count = 0;
  for (const book of bookData) {
    if (book.isCompleted) {
      count += 1;
    }
  }
  return count;
}

function countUnfinishedBookList(bookData) {
  let count = 0;
  for (const book of bookData) {
    if (!book.isCompleted) {
      count += 1;
    }
  }
  return count;
}

function generateWhenNoBook(bookList, text) {
  const p = document.createElement("p");
  p.innerText = text;
  p.classList.add("empty-books");

  bookList.appendChild(p);

  return bookList;
}

function generateBook(bookData) {
  const book = createElementWithClass("article", "book");
  const bigBookIcon = createIconElement("book-2", "book-icon");
  const wrapper = document.createElement("div");
  const title = document.createElement("h3");
  const author = createElementWithClass("p", "book-author");
  const authorIcon = createIconElement("user");
  const buttonWrapper = createElementWithClass("div", "button-wrapper");
  const deleteButton = createButtonWithIconAndTooltip(
    "trash",
    "Hapus buku",
    "delete-button",
    "book-button"
  );
  const editButton = createButtonWithIconAndTooltip(
    "edit",
    "Edit buku",
    "edit-button",
    "book-button"
  );

  title.innerText = `${bookData.title} (${bookData.year})`;

  author.innerText = bookData.author;
  author.appendChild(authorIcon);

  if (bookData.isCompleted) {
    const unfinishedButton = createButtonWithIconAndTooltip(
      "arrows-sort",
      "Belum selesai dibaca",
      "unfinished-book-button",
      "book-button"
    );

    unfinishedButton.addEventListener("click", function () {
      createDialogElement(
        "Pindahkan Buku",
        `Pindahkan buku dengan judul ${bookData.title} ke rak Belum Selesai Dibaca?`,
        "Pindahkan",
        () => toggleIsCompletedButtonHandler(bookData.id),
        "Buku berhasil dipindahkan"
      );
    });

    buttonWrapper.appendChild(unfinishedButton);
  } else {
    const finishedButton = createButtonWithIconAndTooltip(
      "arrows-sort",
      "Selesai dibaca",
      "finished-book-button",
      "book-button"
    );

    finishedButton.addEventListener("click", function () {
      createDialogElement(
        "Pindahkan Buku",
        `Pindahkan buku dengan judul ${bookData.title} ke rak Selesai Dibaca?`,
        "Pindahkan",
        () => toggleIsCompletedButtonHandler(bookData.id),
        "Buku berhasil dipindahkan"
      );
    });

    buttonWrapper.appendChild(finishedButton);
  }

  deleteButton.addEventListener("click", function () {
    deleteButtonHandler(bookData.id);
  });

  editButton.addEventListener("click", function () {
    titleInput.value = bookData.title;
    authorInput.value = bookData.author;
    yearInput.value = bookData.year;
    isCompleted.checked = bookData.isCompleted;

    submitBookButton.innerText = "Edit";
    addEditBookTitle.innerText = "Edit Buku";
    submitFormHandler = function () {
      submitEditBookHandler(bookData.id);
    };
    toggleShowAddEditBook();
  });

  buttonWrapper.appendChild(deleteButton);
  buttonWrapper.appendChild(editButton);

  wrapper.appendChild(title);
  wrapper.appendChild(author);
  wrapper.appendChild(buttonWrapper);

  book.appendChild(bigBookIcon);
  book.appendChild(wrapper);

  return book;
}

function createElementWithClass(element, ...classLists) {
  const createdElement = document.createElement(element);

  createdElement.classList.add(...classLists);

  return createdElement;
}

function createButtonWithIconAndTooltip(iconCode, tooltiptext, ...className) {
  const button = createElementWithClass("button", "tooltip", ...className);
  const icon = createIconElement(iconCode);

  button.appendChild(icon);
  button.setAttribute("data-tooltip", tooltiptext);

  return button;
}

function deleteButtonHandler(bookID) {
  const bookData = getBookList();
  const bookTarget = findBookIndex(bookID);

  createDialogElement(
    "Hapus Buku",
    `Hapus buku dengan judul ${bookData[bookTarget].title}`,
    "Hapus",
    () => deleteBook(bookID),
    "Buku berhasil dihapus"
  );
}

function deleteBook(bookID) {
  const bookData = getBookList();
  const bookTarget = findBookIndex(bookID);

  if (bookTarget === -1) {
    return;
  }

  bookData.splice(bookTarget, 1);
  overideBookList(bookData);

  renderBookList();
}

function toggleIsCompletedButtonHandler(bookID) {
  const bookData = getBookList();
  const bookIndex = findBookIndex(bookID);

  bookData[bookIndex].isCompleted = !bookData[bookIndex].isCompleted;
  overideBookList(bookData);

  renderBookList();
}

function generateId() {
  return +new Date();
}

function findBookIndex(bookID) {
  const bookData = getBookList();

  for (const index in bookData) {
    if (bookData[index].id === bookID) {
      return index;
    }
  }

  return -1;
}

function toggleShowAddEditBook() {
  const addBook = document.getElementById("add-edit-book");

  addBook.classList.toggle("show");
}

function createDialogElement(
  dialogTitle,
  dialogDescription,
  confirmText,
  confirmButtonHandler,
  alertMessage
) {
  const main = document.querySelector("main");
  const section = createElementWithClass("section", "show");
  const card = createElementWithClass("div", "card");
  const h2 = document.createElement("h2");
  const costumDialogContent = createElementWithClass(
    "div",
    "custom-dialog-content"
  );
  const p = document.createElement("p");
  const buttonWrapper = createElementWithClass("div", "button-wrapper");
  const confirmButton = createElementWithClass("button", "book-button");
  const cancelButton = createElementWithClass("button", "book-button");

  section.setAttribute("id", "custom-dialog");

  h2.innerText = dialogTitle;
  h2.setAttribute("id", "custom-dialog-title");

  p.innerText = dialogDescription;
  p.setAttribute("id", "custom-dialog-description");

  confirmButton.innerText = confirmText;
  confirmButton.setAttribute("id", "custom-dialog-confirm-button");

  cancelButton.innerText = "Batal";
  cancelButton.setAttribute("id", "custom-dialog-cancel-button");

  buttonWrapper.appendChild(confirmButton);
  buttonWrapper.appendChild(cancelButton);

  costumDialogContent.appendChild(p);
  costumDialogContent.appendChild(buttonWrapper);

  card.appendChild(h2);
  card.appendChild(costumDialogContent);

  section.appendChild(card);

  main.appendChild(section);

  const customDialog = document.getElementById("custom-dialog");
  const dialogConfirmButton = document.getElementById(
    "custom-dialog-confirm-button"
  );
  const dialogCancelButton = document.getElementById(
    "custom-dialog-cancel-button"
  );

  dialogConfirmButton.addEventListener("click", function () {
    confirmButtonHandler();
    main.removeChild(customDialog);
    alert(alertMessage);
  });

  dialogCancelButton.addEventListener("click", function () {
    main.removeChild(customDialog);
  });
}

function generateFakeData() {
  const bookData = [
    {
      id: 987654321,
      title: "The Subtle Art of not Giving a F*ck",
      author: "Mark Manson",
      year: 2016,
      isCompleted: true,
    },
    {
      id: 456789123,
      title: "The Psychology of Money",
      author: "Morgan Housel",
      year: 2020,
      isCompleted: true,
    },
    {
      id: 147258369,
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      year: 2014,
      isCompleted: false,
    },
    {
      id: 789123456,
      title: "Atomic Habits",
      author: "James Clear",
      year: 2018,
      isCompleted: true,
    },
    {
      id: 654321987,
      title: "Educated",
      author: "Tara Westover",
      year: 2018,
      isCompleted: false,
    },
    {
      id: 321654987,
      title: "The Alchemist",
      author: "Paulo Coelho",
      year: 1988,
      isCompleted: true,
    },
    {
      id: 789456123,
      title: "1984",
      author: "George Orwell",
      year: 1949,
      isCompleted: true,
    },
    {
      id: 159753468,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      year: 1960,
      isCompleted: true,
    },
    {
      id: 369258147,
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      year: 1997,
      isCompleted: true,
    },
    {
      id: 852741963,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      year: 1925,
      isCompleted: true,
    },
    {
      id: 123456789,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      year: 1951,
      isCompleted: false,
    },
    {
      id: 951236874,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      year: 1813,
      isCompleted: false,
    },
    {
      id: 456123789,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      year: 1937,
      isCompleted: false,
    },
    {
      id: 789632145,
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      year: 1954,
      isCompleted: false,
    },
    {
      id: 369874512,
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      year: 1866,
      isCompleted: false,
    },
  ];

  overideBookList(bookData);

  renderBookList();

  console.log("Buku berhasil digenerate");
}

function createIconElement(iconCode, className) {
  const i = createElementWithClass("i", "ti", `ti-${iconCode}`, className);

  return i;
}

function resetAndToggleShowAddBook() {
  bookForm.reset();
  unfocusAllInput();
  toggleShowAddEditBook();
}

function submitAddBookHandler() {
  const newBookData = {
    id: generateId(),
    title: titleInput.value,
    author: authorInput.value,
    year: yearInput.value,
    isCompleted: isCompleted.checked,
  };
  putBookList(newBookData);
  alert("Buku berhasil ditambahkan");
}

function submitEditBookHandler(bookID) {
  const bookData = getBookList();
  const bookTargetIndex = findBookIndex(bookID);

  const newBookData = {
    id: bookID,
    title: titleInput.value,
    author: authorInput.value,
    year: yearInput.value,
    isCompleted: isCompleted.checked,
  };
  bookData[bookTargetIndex] = newBookData;

  overideBookList(bookData);
  alert("Buku berhasil diedit");
}

function loopingAddEventListenerButtons(buttons, handler) {
  for (const button of buttons) {
    button.addEventListener("click", handler);
  }
}

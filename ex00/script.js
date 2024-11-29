
/*Variables para la autenticación de la API de Unsplash*/

const CLIENT_SECRET = "";
const ACCESS_KEY = "";
const REDIRECT_URI = "http://localhost:5500/index.html";
const SCOPES = "public+read_user+write_user+read_photos+write_photos+write_likes+write_followers+read_collections+write_collections";
const AUTH_URL = `https://unsplash.com/oauth/authorize?client_id=${ACCESS_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}`;
const endPoint = "https://api.unsplash.com/search/photos";
var access_token = "";


/*Funciones para el login y logout*/

/**
 * 
 * @returns devuelve un booleano que indica si el usuario está logueado o no
 */
const loggedIn = () => {
	return access_token !== null;
};

/**
 * borra los tokens de acceso
 * redirige al index
 */
const logout = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("refresh_token");
	access_token = null;
	window.location.href = REDIRECT_URI;
};

/**
 * Cambia el texto del botón de login a logout y viceversa
 * Si el usuario está logueado, el botón dirá "Logout" y llamará a la función logout
 * Si el usuario no está logueado, el botón dirá "Login" y llamará a la función login
 * @param {*} loggedIn //booleano que indica si el usuario está logueado o no
 */
const changeLoginButton = (loggedIn) => {
	const loginButton = document.getElementById("login");
	if (loggedIn) {
		loginButton.innerHTML = "Logout";
		loginButton.removeEventListener("click", login);
		loginButton.addEventListener("click", logout);
	} else {
		loginButton.innerHTML = "Login";
		loginButton.removeEventListener("click", logout);
		loginButton.addEventListener("click", login);
	}
};


/*Toma el elemento login(botón) y escucha si hay un click
	* si no esta logeado, redirige a la url de autenticación
	* si esta logeado, llama a la función logout
 */

document.getElementById("login").addEventListener("click", () => {
	if (!loggedIn()) {
		window.location.href = AUTH_URL;
	} else {
		logout();
		window.location.href = AUTH_URL;
	}
  });


/*Unplash API responde con una url en la que se incluye el código de autorización, 
por lo que tenemos que extraerlo de la url para poder usarlo en la siguiente petición
Ej_ http://localhost:5500/project1/index.html?code=7sRv6nRcIBd3mB6aLyFtaha-sDKen8cJlo71bzU79Qw
												  |-----Todo esto es el código de acceso------|*/

/**
 * Extraemos el código de la url creando una instancia de URLSearchParams y obteniendo el valor de la clave "code"
 * *windows.location.search => devuelve la cadena de consulta de la URL, incluido el signo de interrogación (?)
 * *URLSearchParams => permite manipular los parámetros de búsqueda de una URL, d
 * para acceder a ellos
 * *get() => devuelve el primer valor asociado a la clave dada
 * Función para intercambiar el código de autorización por un token de acceso
 * *fetch() => permite hacer peticiones HTTP desde el cliente
 * *await => indica que la ejecución del código debe esperar a que la promesa se resuelva
 * *JSON.stringify() => convierte un objeto o valor de JavaScript en una cadena de texto JSON
 * *localStorage.setItem() => almacena un par clave-valor en el almacenamiento local del navegador
 * 
*/

async function exchangeCodeForToken() {
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get("code");

	const response = await fetch(`https://unsplash.com/oauth/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			client_id: ACCESS_KEY,
			client_secret: CLIENT_SECRET,
			redirect_uri: REDIRECT_URI,
			code: code,
			grant_type: "authorization_code",
		}),
	});
	if (response.ok) {
		const data = await response.json();
		localStorage.setItem("token", data.access_token);
		localStorage.setItem("refresh_token", data.refresh_token);
		access_token = data.access_token;
		document.getElementById("login").innerHTML = `Bienvenido, ${data?.user?.username}`;

	}
}

/**
 * Listener que escucha el evento de carga de la página y cuando está completamente cargada
 * *Extrae el código de la url
 * *Si hay un código de autorización, llama a la función exchangeCodeForToken y redirige a index.html
 * *Si no hay un código de autorización, extrae el token de acceso del almacenamiento local
 * *Si hay un token de acceso, lo muestra en consola y cambia el texto del botón de login
 * 
 * @param {*} query //cadena de texto que se va a buscar
 * @returns //promesa que se resuelve con la respuesta de la petición
 */

document.addEventListener("DOMContentLoaded", async () => {
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get("code");
	if (code) {
		await exchangeCodeForToken();
		window.location.href = REDIRECT_URI;
	} else {
		access_token = localStorage.getItem("token");
		if (access_token) {
			changeLoginButton(true);
		}
	}
	const searchButton = document.getElementById("search-button");
	if (searchButton) {
		searchButton.addEventListener("click", async () => {
			const query = document.getElementById("search-input").value;
			if (!query) {
				alert("Introduce un término de búsqueda");
				return;
			}
			const response = await searchImages(query);
		});
	}
});


/*Funciones para la búsqueda de imágenes*/

async function searchImages(query) {
	const response = await fetch(`${endPoint}?query=${query}`, {
		method: "GET",
		headers: {
	
			Authorization: `Client-ID ${ACCESS_KEY}`,
		},
	});
	if (response.ok) {
		const data = await response.json();
		const urlImg = data.results[0].urls.small; 
		showImages(data.results,  urlImg);
	}
}

/*Añadir las imñagenes al DOM*/

function showImages(images) {
	const gallery = document.getElementById("gallery");
	gallery.innerHTML = "";
	images.forEach((image) => {
		const div = document.createElement("div");
		div.style.minHeight = "200px";
		div.style.width = "100%";
		//crear un enlace
		const link = document.createElement("a");
		link.href = image.links.html;
		link.target = "_blank";
		
		const img = document.createElement("img");
		img.src = image.urls.small;
		img.alt = image.alt_description;
		img.style.height = "200px";
		img.style.width = "100%";

		link.appendChild(img);
		div.appendChild(link);
		
		const likeButton = document.createElement("button");
		likeButton.innerHTML = "Like";
		likeButton.classList.add("like-button");

		likeButton.addEventListener("click", async () => {
			const response = await likeImage(image.id);
			if (response.ok) {
				if (likeButton.innerHTML === "Liked") {
					likeButton.innerHTML = "Like";
					unlikeImage(image.id);
				} else{
					likeButton.innerHTML = "Liked";
					likeImage(image.id);
				}
			}
		});
		div.appendChild(likeButton);
		gallery.appendChild(div);
	});
}

/*Función para dar like a una imagen*/

async function likeImage(imageId) {
	const response = await fetch(`https://api.unsplash.com/photos/${imageId}/like`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	});
	return response;
}

/*Función para quitar like a una imagen*/

async function unlikeImage(imageId) {
	const response = await fetch(`https://api.unsplash.com/photos/${imageId}/like`, {
		method: "DELETE",
		headers:
		{
			Authorization: `Bearer ${access_token}`,
		},
	});
	return response;
}

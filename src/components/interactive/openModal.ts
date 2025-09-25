
let isTransitioning = false;
let modalWrapper: HTMLDivElement;
let items: any;

function openImageTransition(clickedImage, index) {
	if (isTransitioning) return;
	isTransitioning = true;

	const data = imageData[index];
	const rect = clickedImage.getBoundingClientRect();

	// Show overlay
	overlay.classList.add('active');
	overlayTitle.textContent = data.alt;
	document.body.classList.add('overlay-open');

	// Clone the image for transition
	const transitionImg = clickedImage.cloneNode();
	transitionImg.classList.add('transitioning');

	// Set initial position (same as original)
	transitionImg.style.left = rect.left + 'px';
	transitionImg.style.top = rect.top + 'px';
	transitionImg.style.width = rect.width + 'px';
	transitionImg.style.height = rect.height + 'px';
	transitionImg.style.objectFit = 'cover';

	// Add to overlay
	overlay.appendChild(transitionImg);

	// Hide original image
	clickedImage.style.opacity = '0';

	// Wait for image to load if needed, then trigger transition to center
	if (transitionImg.complete) {
		requestAnimationFrame(() => {
			const centerPos = getImageCenterPosition(transitionImg);
			transitionImg.style.left = centerPos.left + 'px';
			transitionImg.style.top = centerPos.top + 'px';
			transitionImg.style.width = centerPos.width + 'px';
			transitionImg.style.height = centerPos.height + 'px';
			transitionImg.style.objectFit = 'contain';
		});
	} else {
		transitionImg.onload = () => {
			requestAnimationFrame(() => {
				const centerPos = getImageCenterPosition(transitionImg);
				transitionImg.style.left = centerPos.left + 'px';
				transitionImg.style.top = centerPos.top + 'px';
				transitionImg.style.width = centerPos.width + 'px';
				transitionImg.style.height = centerPos.height + 'px';
				transitionImg.style.objectFit = 'contain';
			});
		};
	}

	// Store references for closing
	overlay._transitionImg = transitionImg;
	overlay._originalImg = clickedImage;
	overlay._originalRect = rect;
}

// function closeImageTransition() {
// 	if (!isTransitioning) return;

// 	const transitionImg = overlay._transitionImg;
// 	const originalImg = overlay._originalImg;
// 	const originalRect = overlay._originalRect;

// 	if (transitionImg && originalImg) {
// 		// Get current rect in case of window resize
// 		const currentRect = originalImg.getBoundingClientRect();

// 		// Transition back to original position
// 		transitionImg.style.left = currentRect.left + 'px';
// 		transitionImg.style.top = currentRect.top + 'px';
// 		transitionImg.style.width = currentRect.width + 'px';
// 		transitionImg.style.height = currentRect.height + 'px';
// 		transitionImg.style.objectFit = 'cover';

// 		// After transition completes
// 		setTimeout(() => {
// 			overlay.classList.remove('active');
// 			document.body.classList.remove('overlay-open');
// 			originalImg.style.opacity = '1';
// 			transitionImg.remove();

// 			// Clean up references
// 			delete overlay._transitionImg;
// 			delete overlay._originalImg;
// 			delete overlay._originalRect;

// 			isTransitioning = false;
// 		}, 300); // Match transition duration
// 	}
// }

// // Close overlay handlers
// overlayClose?.addEventListener('click', closeImageTransition);
// overlayBackdrop?.addEventListener('click', closeImageTransition);

// // Close on Escape key
// document.addEventListener('keydown', (e) => {
// 	if (e.key === 'Escape' && overlay?.classList.contains('active')) {
// 		closeImageTransition();
// 	}
// });

// // Handle window resize during transition
// window.addEventListener('resize', () => {
// 	if (isTransitioning && overlay._transitionImg) {
// 		const centerPos = getImageCenterPosition(overlay._transitionImg);
// 		const transitionImg = overlay._transitionImg;
// 		transitionImg.style.left = centerPos.left + 'px';
// 		transitionImg.style.top = centerPos.top + 'px';
// 		transitionImg.style.width = centerPos.width + 'px';
// 		transitionImg.style.height = centerPos.height + 'px';
// 	}
// });
//

	/* Add a subtle glow effect */
	// .gallery-item::before {
	// 	content: '';
	// 	position: absolute;
	// 	top: 0;
	// 	left: 0;
	// 	right: 0;
	// 	bottom: 0;
	// 	background: linear-gradient(45deg, rgba(65, 180, 233, 0.1), rgba(77, 237, 255, 0.1));
	// 	opacity: 0;
	// 	transition: opacity 0.3s ease;
	// 	pointer-events: none;
	// 	border-radius: 12px;
	// }

	// .gallery-item:hover::before,
	// .gallery-item.focused::before {
	// 	opacity: 1;
	// }

	// /* Image Transition Overlay */
	// .image-overlay {
	// 	position: fixed;
	// 	top: 0;
	// 	left: 0;
	// 	width: 100vw;
	// 	height: 100vh;
	// 	z-index: 1000;
	// 	opacity: 0;
	// 	visibility: hidden;
	// 	transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	// 	pointer-events: none;
	// }

	// .image-overlay.active {
	// 	opacity: 1;
	// 	visibility: visible;
	// 	pointer-events: all;
	// }

	// .overlay-backdrop {
	// 	position: absolute;
	// 	top: 0;
	// 	left: 0;
	// 	width: 100%;
	// 	height: 100%;
	// 	background: rgba(0, 0, 0, 0);
	// 	backdrop-filter: blur(0px);
	// 	cursor: pointer;
	// 	transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	// }

	// .image-overlay.active .overlay-backdrop {
	// 	background: rgba(0, 0, 0, 0.9);
	// 	backdrop-filter: blur(10px);
	// }

	// .overlay-close {
	// 	position: absolute;
	// 	top: 40px;
	// 	right: 40px;
	// 	background: rgba(255, 255, 255, 0.1);
	// 	border: 2px solid rgba(255, 255, 255, 0.2);
	// 	color: white;
	// 	font-size: 24px;
	// 	width: 40px;
	// 	height: 40px;
	// 	border-radius: 50%;
	// 	cursor: pointer;
	// 	display: flex;
	// 	align-items: center;
	// 	justify-content: center;
	// 	transition: all 0.3s ease;
	// 	z-index: 1001;
	// 	opacity: 0;
	// 	transform: scale(0.8);
	// }

	// .image-overlay.active .overlay-close {
	// 	opacity: 1;
	// 	transform: scale(1);
	// 	transition-delay: 0.3s;
	// }

	// .overlay-close:hover {
	// 	background: rgba(255, 255, 255, 0.2);
	// 	border-color: rgba(255, 255, 255, 0.4);
	// 	transform: scale(1.1);
	// }

	// .overlay-info {
	// 	position: absolute;
	// 	bottom: 40px;
	// 	left: 50%;
	// 	transform: translateX(-50%);
	// 	text-align: center;
	// 	opacity: 0;
	// 	transform: translateX(-50%) translateY(20px);
	// 	transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	// }

	// .image-overlay.active .overlay-info {
	// 	opacity: 1;
	// 	transform: translateX(-50%) translateY(0);
	// 	transition-delay: 0.3s;
	// }

	// .overlay-title {
	// 	color: white;
	// 	font-size: 18px;
	// 	font-weight: 500;
	// 	margin: 0;
	// 	opacity: 0.9;
	// }

	// /* Gallery image transition states */

	// .gallery-image.transitioning {
	// 	position: fixed !important;
	// 	z-index: 1001 !important;
	// 	transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1) !important;
	// 	border-radius: 12px;
	// 	box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
	// }

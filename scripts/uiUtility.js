// UI Utilities script

// Contributors:
// Richard B. Johnson

function hexFromRGB(r,g,b) {
	return "#" + (b | (g << 8) | (r << 16)).toString(16);
}

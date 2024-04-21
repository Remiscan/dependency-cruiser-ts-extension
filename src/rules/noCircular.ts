export default {
	"name": "no-circular",
	"severity": "warn",
	"from": { "pathNot": "^(node_modules)" },
	"to": { "circular": true }
}
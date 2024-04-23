# Change Log

## [0.1.4]

- When you create a `.dependency-cruiser.json` file at the root of your workspace folder to overwrite the extension settings for `dependency-cruiser`, the rules and options passed to `dependency-cruiser` will now be overwritten independently from each other.

	That way, you can overwrite the rules while keeping the extension's visual settings, or the opposite. And you can easily reset everything by putting this in the `.dependency-cruiser.json` file :

	```json
	{
		"options": { // this overwrites all extension settings (except rules)
			"outputType": "dot"
		},
		"forbidden": [], // this overwrites all extension rules
		"allowed": [],
		"required": []
	}
	```

## [0.1.0]

- Initial release
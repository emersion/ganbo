all: ganbo.zip

.PHONY: ganbo.zip
ganbo.zip:
	git archive --format=zip HEAD >ganbo.zip

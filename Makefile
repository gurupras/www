all: build | silent

config_test:
	@if [ ! -f config/default.json ]; then mkdir -p config; cp .default.json config/default.json; echo "'config/default.json' did not exist..created! Please edit and re-run make!"; exit 1; fi

config: config_test
	@cp -R config build/
build:
	@node index.js $(DEPLOY) $(CHECK)
	@while [ -n "$(find build -depth -type d -empty -print -exec rmdir {} +)" ]; do :; done
	@cp server.js build/server.js

deploy: DEPLOY = --deploy
deploy: check build

check: CHECK = --check
check: build

install:
	@npm install

silent:
	@:

run: build config
	@cd build && node server

clean:
	@rm -rf build

statics:
	@wget http://google-analytics.com/ga.js -O assets/js/ga.js 2>/dev/null

.PHONY: run clean silent build

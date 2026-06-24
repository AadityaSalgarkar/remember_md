SHELL := /bin/bash

APP_NAME := Remember
APP_BUNDLE := src-tauri/target/release/bundle/macos/$(APP_NAME).app
APPLICATIONS_DIR ?= /Applications
INSTALLED_APP := $(APPLICATIONS_DIR)/$(APP_NAME).app
BACKUP_ROOT ?= /tmp

.PHONY: help deps dev check build macos-install macos-install-clean open-macos uninstall-macos clean-build clean-dist clean-tauri

help:
	@printf "Remember build targets\n\n"
	@printf "  make deps                 Install npm dependencies\n"
	@printf "  make dev                  Run the Tauri dev app\n"
	@printf "  make check                Run frontend build and Rust check\n"
	@printf "  make build                Build the release Tauri app and DMG\n"
	@printf "  make macos-install        Build and install Remember.app to /Applications\n"
	@printf "  make macos-install-clean  Build, install, then remove generated build artifacts\n"
	@printf "  make open-macos           Open the installed app\n"
	@printf "  make clean-build          Remove dist/ and src-tauri/target/\n"
	@printf "  make uninstall-macos      Remove /Applications/Remember.app\n"

deps:
	npm install

dev:
	npm run tauri dev

check:
	npm run build
	cd src-tauri && cargo check

build:
	npm run tauri build

macos-install: build
	@test -d "$(APP_BUNDLE)" || { echo "Missing app bundle: $(APP_BUNDLE)" >&2; exit 1; }
	@osascript -e 'tell application "$(APP_NAME)" to quit' >/dev/null 2>&1 || true
	@if [ -d "$(INSTALLED_APP)" ]; then \
		backup="$(BACKUP_ROOT)/$(APP_NAME).app.backup.$$(date +%Y%m%d%H%M%S)"; \
		echo "Backing up existing app to $$backup"; \
		mv "$(INSTALLED_APP)" "$$backup"; \
	fi
	@echo "Installing $(APP_BUNDLE) to $(INSTALLED_APP)"
	@ditto "$(APP_BUNDLE)" "$(INSTALLED_APP)"
	@xattr -dr com.apple.quarantine "$(INSTALLED_APP)" >/dev/null 2>&1 || true
	@echo "Installed $(INSTALLED_APP)"

macos-install-clean: macos-install clean-build

open-macos:
	open "$(INSTALLED_APP)"

uninstall-macos:
	@osascript -e 'tell application "$(APP_NAME)" to quit' >/dev/null 2>&1 || true
	rm -rf "$(INSTALLED_APP)"

clean-build: clean-dist clean-tauri

clean-dist:
	rm -rf dist

clean-tauri:
	rm -rf src-tauri/target

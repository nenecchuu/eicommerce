cli:
	pnpm tsx scripts/cli/index.ts $(filter-out $@,$(MAKECMDGOALS))

%:
	@:

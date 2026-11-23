# Start here (free version)

Instructions for Claude to set up the Scene Factory the first time. Follow them in order and talk to the person in
plain English, one line per step.

## From a phone (in the cloud)

If the `CLAUDE_CODE_REMOTE` variable is `true`, the person is on their phone and you are on a cloud computer, inside
their GitHub repository. Before the steps below:

1. If the factory is still inside a `.zip` file in the repository, unzip it. If the files ended up inside a subfolder
   (`scene-factory/`), move everything from it to the root of the repository, including files starting with a dot,
   and delete the empty subfolder and the `.zip`.
2. Make a commit ("Scene Factory installed") and `git push` on the branch the session is on, so the install is saved.
3. Follow the steps below. Node.js is already available in the cloud.

## The steps

1. Say: "I'm setting up your Scene Factory. The first time takes 2 to 5 minutes."
2. Check that Node.js exists (`node --version`). If it doesn't, or it's older than 18, explain in one sentence that
   Node.js needs to be installed (free program, nodejs.org, LTS version), wait for the person to install it and
   carry on.
3. Run `node ferramentas/preparar.mjs`. It installs the engine and the browser that draws the frames (about 100 MB,
   only once). If the internet drops midway, run it again: it picks up where it stopped. In the cloud, if nothing
   downloads, see "In the cloud" in `CLAUDE.md` (the environment's network access may be blocked). Its messages are
   in Portuguese: relay them in English.
4. Run `npx tsc --noEmit -p .` and then `node ferramentas/previa.mjs exemplo-ceu-azul 9`.
5. Open the frame it took and check that the Sun with the rainbow ray and the caption show up.
6. Tell the person everything is ready and give three request ideas, for example:
   - "Make a 40-second video explaining why the sea is salty."
   - "Tell the story of the invention of the light bulb in 1 minute. You pick the style."
   - "Show me the styles you have."
   Mention this is the free version, with 3 styles (Notebook, Neon and Voxel).
7. From here on, follow `CLAUDE.md` for every request.

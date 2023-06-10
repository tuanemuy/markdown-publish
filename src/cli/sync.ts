import fs from "node:fs/promises";
import path from "path";
import { nanoid } from "nanoid";

async function sync() {
  try {
    const files = await fs.readdir(path.resolve(__dirname, "../vault"));
    await Promise.all(
      files
        .filter((file) => {
          return file !== ".gitkeep";
        })
        .map((file) => {
          fs.unlink(path.resolve(__dirname, "../vault", file))
            .then(() => {
              console.log(`${file} has been deleted`);
            })
            .catch(() => console.log(`Failed to delete file: ${file}`));
        })
    );
  } catch (e: any) {
    throw new Error(`Failed to clean directory: ${e.message}`);
  }

  const dir = process.env.SYNC_DIR;

  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch (e: any) {
    throw new Error(`Failed to read directory: ${e.message}`);
  }

  const filesToSync = files.filter((file) => {
    return file.match(/^.+@.*\.md$/) !== null;
  });

  let renamedFilesToSync = [];
  try {
    const renames = filesToSync.map(async (file) => {
      return rename(dir, file)
        .then((newFile) => {
          console.log(`${file} has been renamed: ${newFile}`);
          return newFile;
        })
        .catch((e) => {
          console.log(`Failed to rename ${file}: ${e.message}`);
          return null;
        });
    });
    renamedFilesToSync = (await Promise.all(renames)).filter(
      (file): file is string => file !== null
    );
  } catch (e: any) {
    throw new Error(`Failed to rename files: ${e.message}`);
  }

  try {
    const copies = renamedFilesToSync.map((file) => {
      copy(file, dir, path.resolve(__dirname, "../vault"))
        .then(() => {
          console.log(`${file} has been copied`);
        })
        .catch((e) => {
          console.log(`Failed to copy ${file}: ${e.message}`);
        });
    });

    await Promise.all(copies);
  } catch (e: any) {
    throw new Error(`Failed to copy files: ${e.message}`);
  }
}

async function rename(dir: string, file: string) {
  const match = file.match(/^(?<title>.+)@\.md$/);
  if (match && match.groups) {
    const newFile = `${match.groups.title}@${nanoid(8)}.md`;
    try {
      await fs.rename(path.resolve(dir, file), path.resolve(dir, newFile));
    } catch (e: any) {
      throw new Error(`Failed to rename ${file}: ${e.message}`);
    }
    return newFile;
  } else {
    return file;
  }
}

async function copy(fileName: string, srcDir: string, targetDir: string) {
  const status = await fs.stat(path.resolve(srcDir, fileName));
  const newFileName = `${Math.round(status.birthtimeMs)}%${Math.round(
    status.mtimeMs
  )}%${fileName}`;

  await fs.copyFile(
    path.resolve(srcDir, fileName),
    path.resolve(targetDir, newFileName)
  );
}

try {
  sync();
} catch (e: any) {
  console.log(e.message);
  process.exit(1);
}

# Minecraft-like Game Scene Renderer
Group 3 of CSIT6000L Digital Design, 2022 Spring

## Test
```
./test_all.sh
```

## Blurring Feature
### Examples
![image alt >](https://user-images.githubusercontent.com/55251580/164992036-97c0e033-b153-4ce2-b7e7-e05fb003b629.png)
*Normal output*

![image alt <](https://user-images.githubusercontent.com/55251580/164992108-5a3159f4-2bef-42a8-af70-385561cb3364.png)
*Blurred with focus_length=6.5*

![image alt ><](https://user-images.githubusercontent.com/55251580/164992137-bb3a8678-2c3e-4a12-ac3e-61070577b723.png)
*Blurred with focus_length=3.5*

### Flag
```
-blurry [focus_length] [output_file]
```

## Web UI
## Prerequisites
1. Linux environment preferred (Arch Linux / Ubuntu) 
 - [Windows Subsystem of Linux](https://docs.microsoft.com/en-us/windows/wsl/install) is recommended
     - [Ubuntu WSL](https://ubuntu.com/wsl)
     - [Arch WSL](https://github.com/yuk7/ArchWSL)

2. [NodeJS](https://nodejs.org/en/) (v17.9.0 or above) and [NPM](https://www.npmjs.com/)
```bash
# For Arch Linux
sudo pacman -S nodejs npm

# For Ubuntu
sudo apt-get install nodejs
```

3. [Yarn Package Manager](https://yarnpkg.com/)
```bash
npm install --global yarn
```

4. [Emscripten SDK](https://emscripten.org/docs/tools_reference/emsdk.html) (in ~/emsdk by default)
```bash
cd ~

# Get the emsdk repo
git clone https://github.com/emscripten-core/emsdk.git

# Enter that directory
cd emsdk

# Fetch the latest version of the emsdk (not needed the first time you clone)
git pull

# Download and install the latest SDK tools.
./emsdk install latest

# Make the "latest" SDK "active" for the current user. (writes .emscripten file)
./emsdk activate latest
```

## Usage
1. In the project directory, build the web project using Emscripten SDK

```bash
# Activate PATH and other environment variables in the current terminal
source ~/emsdk/emsdk_env.sh

# Build the project
emmake make web
```

2. Install node modules
```bash
# Enter the front directory
cd front

# Install node modules
yarn
```

3. Host the frontend
- Start the development server
    ```bash
    yarn start
    ```

-  or build packaged frontend
    ```bash
    yarn build
    
    # If you have python installed, start HTTP server to view results
    python -m http.server -d dist/
    ```
    
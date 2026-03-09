# it114l-finalproj

A web application built with React (Vite) on the frontend and ASP.NET Core on the backend.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or later)

## Getting Started

### 1. Run the application

**Option A — Visual Studio**

Open `it114l-finalproj.sln` and press **F5**. Visual Studio will automatically run `npm install` and launch the Vite dev server — no manual setup needed.

**Option B — CLI**

Install client dependencies first:

```bash
cd it114l-finalproj.client
npm install
```

Then in one terminal, start the Vite dev server:

```bash
cd it114l-finalproj.client
npm run dev
```

In another terminal, start the ASP.NET Core server:

```bash
cd it114l-finalproj.Server
dotnet run
```

The API will be available at `https://localhost:7xxx` and the Swagger UI at `/swagger`.

## Project Structure

```
it114l-finalproj/
├── it114l-finalproj.client/   # React + Vite frontend
└── it114l-finalproj.Server/   # ASP.NET Core backend
```

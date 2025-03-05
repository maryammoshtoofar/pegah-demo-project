
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

## RUN apt-get update
RUN apt-get -y install curl
RUN curl -SLO https://deb.nodesource.com/nsolid_setup_deb.sh
RUN chmod 500 nsolid_setup_deb.sh
RUN ./nsolid_setup_deb.sh 22
RUN apt-get install -y nodejs
RUN npm install -g yarn

COPY ["Framework.tar", "/"]
RUN tar -xvf /Framework.tar

COPY ["PegahFramework/PegahFramework.csproj", "PegahFramework/"]
COPY ["PegahFramework.Server/PegahFramework.Server.csproj", "PegahFramework.Server/"]
COPY ["PegahFramework.Server/package.json", "PegahFramework.Server/"]
COPY ["package.json", ""]
COPY ["yarn.lock", ""]

WORKDIR "/src/PegahFramework.Server"
RUN yarn install

WORKDIR /src
RUN dotnet restore "PegahFramework.Server/PegahFramework.Server.csproj"

COPY . .
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR "/src/PegahFramework.Server"
RUN yarn run build-production

FROM build AS publish
RUN dotnet publish "PegahFramework.Server.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
RUN apt-get update && apt-get install -y libgdiplus
RUN apt-get update && apt-get install -y libfontconfig1
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PegahFramework.Server.dll"]

-- CreateTable
CREATE TABLE `Lobby` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('WAITING', 'IN_PROGRESS', 'FINISHED') NOT NULL DEFAULT 'WAITING',
    `maxPlayers` INTEGER NOT NULL DEFAULT 4,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LobbyUser` (
    `id` VARCHAR(191) NOT NULL,
    `lobbyId` VARCHAR(191) NOT NULL,
    `isReady` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `LobbyUser_userId_lobbyId_key`(`userId`, `lobbyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LobbyUser` ADD CONSTRAINT `LobbyUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LobbyUser` ADD CONSTRAINT `LobbyUser_lobbyId_fkey` FOREIGN KEY (`lobbyId`) REFERENCES `Lobby`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

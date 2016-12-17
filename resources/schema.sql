-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema thunder
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `thunder` ;

-- -----------------------------------------------------
-- Schema thunder
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `thunder` DEFAULT CHARACTER SET utf8 ;
USE `thunder` ;

-- -----------------------------------------------------
-- Table `thunder`.`User`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `thunder`.`User` ;

CREATE TABLE IF NOT EXISTS `thunder`.`User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(32) NOT NULL,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
COMMENT = 'A user is one finger clicking one mouse, touching one screen.\n\nEach is associated with one group, the home group.';


-- -----------------------------------------------------
-- Table `thunder`.`Group`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `thunder`.`Group` ;

CREATE TABLE IF NOT EXISTS `thunder`.`Group` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
COMMENT = 'A group can belong to other groups.\n\nA group can ratify any node, if all groups in that group have ratified it, then that group has ratified it.';


-- -----------------------------------------------------
-- Table `thunder`.`UserGroup`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `thunder`.`UserGroup` ;

CREATE TABLE IF NOT EXISTS `thunder`.`UserGroup` (
  `user_id` INT NOT NULL,
  `group_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `group_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `thunder`.`GroupGroup`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `thunder`.`GroupGroup` ;

CREATE TABLE IF NOT EXISTS `thunder`.`GroupGroup` (
  `group_id` INT NOT NULL,
  `child_group_id` INT NOT NULL,
  `association_status` VARCHAR(45) NOT NULL COMMENT 'In what spirit was the association made?\n\nAUTO: The system algorithmically lumped this group into this parent group. The association is loose. User may formalize it at will. The association is not declared within the UI, and the user cannot normally observe it, but the system offers it in subtle ways, like how Facebook is always aware that you have a high degree of correlation on the social graph with other people but only suggests them as friends occasionally. This creates the illusion of separation.\n\nMANUAL: Indicates that the user has opted-into a group via the UI. As the UI presents grouping, this association status represents the majority of group presentation.\n\n',
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`, `child_group_id`))
ENGINE = InnoDB
COMMENT = 'Associates one group with another group. When group 42 votes unanimously to join group 12, that association is recorded here like:\n\ngroup_id = 12\nchild_group_id = 42\nassociation_status = MANUAL\ndate = <date of the unanimous vote>\n';


-- -----------------------------------------------------
-- Table `thunder`.`Node`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `thunder`.`Node` ;

CREATE TABLE IF NOT EXISTS `thunder`.`Node` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `data` VARCHAR(45) NOT NULL,
  `view` VARCHAR(45) NOT NULL,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `thunder`.`Connection`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `thunder`.`Connection` ;

CREATE TABLE IF NOT EXISTS `thunder`.`Connection` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `node_id` INT NOT NULL,
  `child_node_id` INT NOT NULL,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`, `node_id`, `child_node_id`))
ENGINE = InnoDB
COMMENT = 'Connection between Nodes.';


-- -----------------------------------------------------
-- Table `thunder`.`Ratification`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `thunder`.`Ratification` ;

CREATE TABLE IF NOT EXISTS `thunder`.`Ratification` (
  `group_id` INT NOT NULL COMMENT 'Which',
  `node_id` INT NOT NULL COMMENT 'Which node is being ratified?',
  `voter_group_id` INT NOT NULL COMMENT 'Which child group ratified the node?',
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The date of the ratification.',
  `comment` VARCHAR(45) NULL,
  PRIMARY KEY (`group_id`, `node_id`, `voter_group_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `thunder`.`Session`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `thunder`.`Session` ;

CREATE TABLE IF NOT EXISTS `thunder`.`Session` (
  `user_id` INT NOT NULL,
  `first_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

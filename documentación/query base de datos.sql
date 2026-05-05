create table facultad (
	id_facultad serial primary key,
	nombre varchar(100) not null unique
);

create table carrera (
	id_carrera serial primary key,
	facultad int references facultad(id_facultad) not null,
	nombre varchar(100) not null unique
);

create table rol (
	id_rol serial primary key,
	nombre varchar(50) not null unique,
	descripcion text
);

create table usuario (
	id_usuario serial primary key,
	cedula char(10) not null unique,
	nombres varchar(200) not null,
	apellidos varchar(200) not null,
	correo varchar(255) not null unique,
	contrasenia text not null,
	carrera int references carrera(id_carrera),
	foto_url text,
	activo boolean not null default true,
	intentos_fallidos int not null default 0,
	tiempo_bloqueo timestamp,
	creado_en timestamp not null default now()
);

create table usuario_rol (
	usuario int not null references usuario(id_usuario) on delete cascade,
	rol int not null references rol(id_rol) on delete cascade,
	primary key (usuario, rol),
	asignado_por int references usuario(id_usuario)
);

create table token_verificacion (
	id_token serial primary key,
	usuario int not null references usuario(id_usuario) on delete cascade,
	expira_en timestamp not null,
	usado boolean not null default false
);

create table nivel_microcredencial (
	id_nivel serial primary key,
	nombre varchar(150) not null unique
);

create table area_conocimiento (
	id_area serial primary key,
	nombre varchar(200) not null unique
);

create table microcredencial (
	id_microcredencial serial primary key,
	emisor int references usuario(id_usuario) not null,
	nombre varchar(300) not null unique,
	descripcion text not null,
	criterios_evaluacion text not null,
	nivel int references nivel_microcredencial(id_nivel) not null,
	duracion_horas int not null,
	area_conocimiento int references area_conocimiento(id_area) not null,
	competencias text[] not null,
	imagen_url text not null,
	metadata_ob3 jsonb,
	estado varchar(30) not null default 'Pendiente' check (estado in ('Pendiente','Aprobada','Rechazada','Inactiva','Eliminada')),
	justificacion_rechazo text,
	aprobado_por int references usuario(id_usuario),
	aprobado_en timestamp,
	eliminado boolean not null default false,
	creado_en timestamp not null default now()
);

create table insignia_emitida (
	id_insignia serial primary key,
	microcredencial int references microcredencial(id_microcredencial) not null,
	emisor int references usuario(id_usuario) not null,
	receptor int references usuario(id_usuario) not null,
	id_global uuid not null default gen_random_uuid() unique,
	url_externo text not null unique,
	firma_JWS text not null,
	certificado_publico text not null,
	fecha_emision timestamp not null default now(),
	png_baked_url text,
	assertion_jsonld jsonb not null,
	estado varchar(20) not null default 'Activa' check (estado in ('Activa', 'Revocada')),
	unique(microcredencial, receptor)
);

create table revocacion_insignia (
	id_revocacion serial primary key,
	insignia int references insignia_emitida(id_insignia) not null,
	revocado_por int references usuario(id_usuario) not null,
	justificacion text not null,
	revocado_en timestamp not null default now()
);

create table perfil_academico (
	receptor int not null references usuario(id_usuario) on delete cascade,
	insignia int not null references insignia_emitida(id_insignia) on delete cascade,
	visible boolean not null default true,
	orden int,
	primary key (receptor, insignia)
);

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
	telefono char(10) unique,
	contrasenia text not null,
	carrera int references carrera(id_carrera),
	foto_url text,
	activo boolean not null default true,
	intentos_fallidos int not null default 0,
	tiempo_bloqueo timestamp,
	creado_en timestamp not null default now(),
	ultima_actualizacion timestamp not null default now()
);

create table usuario_rol (
	usuario int not null references usuario(id_usuario) on delete cascade,
	rol int not null references rol(id_rol) on delete cascade,
	primary key (usuario, rol),
	asignado_por int references usuario(id_usuario),
	creado_en timestamp not null default now(),
	ultima_actualizacion timestamp not null default now()
);

create table nivel_microcredencial (
	id_nivel serial primary key,
	nombre varchar(150) not null unique
);

create table area_conocimiento (
	id_area serial primary key,
	nombre varchar(200) not null unique
);

create table estado_microcredencial (
	id_estado serial primary key,
	nombre varchar(50) not null unique
);

create table microcredencial (
	id_microcredencial serial primary key,
	emisor int references usuario(id_usuario) not null,
	nombre varchar(300) not null,
	descripcion text not null,
	criterios_evaluacion text not null,
	nivel int references nivel_microcredencial(id_nivel) not null,
	duracion_horas int not null,
	area_conocimiento int references area_conocimiento(id_area) not null,
	competencias text[] not null,
	imagen_url text not null,
	metadata_ob3 jsonb,
	estado int references estado_microcredencial(id_estado) not null default 1,
	justificacion_rechazo text,
	evaluado_por int references usuario(id_usuario),
	inactivado_por int references usuario(id_usuario),
	aprobado_en timestamp,
	eliminado boolean not null default false,
	creado_en timestamp not null default now(),
	ultima_actualizacion timestamp not null default now()
);

create table estado_insignia (
	id_estado serial primary key,
	nombre varchar(50) not null unique
);

create table insignia_emitida (
	id_insignia serial primary key,
	microcredencial int references microcredencial(id_microcredencial) not null,
	emisor int references usuario(id_usuario) not null,
	receptor int references usuario(id_usuario) not null,
	id_global uuid not null default gen_random_uuid() unique,
	url_externo text not null unique,
	firma_JWS text not null,
	certificado_publico text,
	fecha_emision timestamp not null default now(),
	png_baked_url text,
	assertion_jsonld jsonb not null,
	estado int references estado_insignia(id_estado) not null default 1
);

create table revocacion_insignia (
	id_revocacion serial primary key,
	insignia int references insignia_emitida(id_insignia) not null,
	revocado_por int references usuario(id_usuario) not null,
	justificacion text not null,
	revocado_en timestamp not null default now()
);

create table token_verificacion (
	id_token serial primary key,
	usuario int not null references usuario(id_usuario) on delete cascade,
	token varchar(255) not null unique,
	expira_en timestamp not null,
	usado boolean not null default false,
	creado_en timestamp not null default now()
);

create table perfil_usuario (
    receptor int primary key references usuario(id_usuario) on delete cascade,
    descripcion text,
	agrupar_insignias boolean not null default false,
    ultima_actualizacion timestamp not null default now()
);


create table insignias_perfil (
	receptor int not null references usuario(id_usuario) on delete cascade,
	insignia int not null references insignia_emitida(id_insignia) on delete cascade,
	orden int,
	ultima_actualizacion timestamp not null default now(),
	primary key (receptor, insignia)
);

create table configuracion_sistema (
	id_config serial primary key,
	emisor_url text not null unique,
	clave_publica text not null,
	clave_privada text not null,
	creado_en timestamp not null default now(),
	ultima_actualizacion timestamp not null default now()
);

insert into facultad (nombre) values 
('Administración de Empresas'),
('Ciencias'),
('Ciencias Pecuarias'),
('Informática y Electrónica'),
('Mecánica'),
('Recursos Naturales'),
('Salud Pública');

insert into carrera (facultad, nombre) values
(1, 'Administración de Empresas'),
(1, 'Contabilidad y Auditoría'),
(1, 'Finanzas'),
(1, 'Marketing'),
(1, 'Gestión del Transporte'),
(1, 'Economía y Comercio'),
(1, 'Derecho'),
(1, 'Gestión de la Inteligencia de los Negocios'),
(2, 'Ingeniería Química'),
(2, 'Química'),
(2, 'Ingeniería Ambiental'),
(2, 'Bioquímica y Farmacia'),
(2, 'Estadística'),
(2, 'Matemática'),
(2, 'Física'),
(3, 'Zootécnica'),
(3, 'Agroindustria'),
(3, 'Veterinaria'),
(4, 'Diseño Gráfico'),
(4, 'Software'),
(4, 'Electricidad'),
(4, 'Tecnologías de la Información'),
(4, 'Electrónica y Automatización'),
(4, 'Electrónica, Telecomunicaciones y Redes'),
(4, 'Telemática'),
(5, 'Mecánica'),
(5, 'Ingeniería Industrial'),
(5, 'Mantenimiento Industrial'),
(5, 'Ingeniería Automotriz'),
(6, 'Agronomía'),
(6, 'Forestal'),
(6, 'Turismo'),
(6, 'Recursos Naturales Renovables'),
(6, 'Minas'),
(6, 'Geomática'),
(6, 'Geología Ambiental'),
(7, 'Promoción de la Salud'),
(7, 'Medicina'),
(7, 'Nutrición y Dietética'),
(7, 'Gastronomía');

insert into rol (nombre, descripcion) values
('Administrador', 'Es el encargado de la gestión global y el control de calidad del sistema. Tiene el nivel de acceso más alto.'),
('Emisor', 'Es la autoridad académica o el docente responsable de diseñar y otorgar los reconocimientos.'),
('Receptor', 'Es el usuario final que adquiere las competencias y es el dueño de las insignias digitales otorgadas.');

--Credenciales del admin del sistema, cambiar contraseña por una real | Contraseña: 1234567890
insert into usuario(cedula, nombres, apellidos, correo, contrasenia) values 
('1234567890', 'Admin', 'Primario', 'admin@espoch.edu.ec', '$2b$10$68r5GkkH3zeGawDAiUwjJuKkhez9U6Z0QRuM6jueSDO.hF5p4GTMa');

insert into usuario_rol (usuario, rol) values (1, 1), (1, 2), (1, 3);

insert into nivel_microcredencial (nombre) values
('Básico'),
('Intermedio'),
('Avanzado'),
('Experto');

insert into area_conocimiento (nombre) values 
('Programas y cualificaciones genéricos'),
('Educación'),
('Artes y humanidades'),
('Ciencias sociales, periodismo e información'),
('Negocios, administración y derecho'),
('Ciencias naturales, matemáticas y estadística'),
('Tecnologías de la información y la comunicación'),
('Ingeniería, manufactura y construcción'),
('Agricultura, silvicultura, pesquería y veterinaria'),
('Salud y bienestar'),
('Servicios'); 

insert into estado_microcredencial (nombre) values 
('Pendiente'), 
('Aprobada'),
('Rechazada'),
('Inactiva');

insert into estado_insignia (nombre) values 
('Activa'), 
('Revocada');


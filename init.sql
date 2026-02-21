--
-- PostgreSQL database dump
--

\restrict etazh7fohovecpe7tR9ZBe632uJchJQueyCVS2o3eLHcL3eHiNDrcfTfetIioTi

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: inventario_user
--

CREATE TABLE public.categorias (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(200),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone
);


ALTER TABLE public.categorias OWNER TO inventario_user;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: inventario_user
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categorias_id_seq OWNER TO inventario_user;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: inventario_user
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: inventario_user
--

CREATE TABLE public.movimientos_inventario (
    id bigint NOT NULL,
    producto_id bigint NOT NULL,
    tipo_movimiento character varying(20) NOT NULL,
    cantidad integer NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion timestamp(6) without time zone,
    motivo character varying(100),
    observacion character varying(500),
    proveedor_id bigint
);


ALTER TABLE public.movimientos_inventario OWNER TO inventario_user;

--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: inventario_user
--

CREATE SEQUENCE public.movimientos_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.movimientos_inventario_id_seq OWNER TO inventario_user;

--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: inventario_user
--

ALTER SEQUENCE public.movimientos_inventario_id_seq OWNED BY public.movimientos_inventario.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: inventario_user
--

CREATE TABLE public.productos (
    id bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion character varying(500),
    precio numeric(10,2) NOT NULL,
    stock integer NOT NULL,
    categoria_id bigint,
    proveedor_id bigint,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone,
    stock_minimo integer DEFAULT 0
);


ALTER TABLE public.productos OWNER TO inventario_user;

--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: inventario_user
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.productos_id_seq OWNER TO inventario_user;

--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: inventario_user
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: inventario_user
--

CREATE TABLE public.proveedores (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    contacto character varying(100),
    telefono character varying(20),
    email character varying(100),
    direccion character varying(200),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone
);


ALTER TABLE public.proveedores OWNER TO inventario_user;

--
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: inventario_user
--

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proveedores_id_seq OWNER TO inventario_user;

--
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: inventario_user
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: movimientos_inventario id; Type: DEFAULT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.movimientos_inventario ALTER COLUMN id SET DEFAULT nextval('public.movimientos_inventario_id_seq'::regclass);


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- Name: productos fk_categoria; Type: FK CONSTRAINT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- Name: movimientos_inventario fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: productos fk_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: inventario_user
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict etazh7fohovecpe7tR9ZBe632uJchJQueyCVS2o3eLHcL3eHiNDrcfTfetIioTi


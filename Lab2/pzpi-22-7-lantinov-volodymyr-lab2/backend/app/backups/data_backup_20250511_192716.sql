--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.12 (Debian 15.12-0+deb12u2)

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

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: database
--

INSERT INTO public.alembic_version VALUES ('c9ac2f0e609e');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: database
--

INSERT INTO public.users VALUES (1, 'admin', 'string', 'string', 'admin@example.com', NULL, '$2b$12$CucA17qaBHpqCHQQprXY/OhuBmR112Z5vUhyHrrKcm.cF3YS9uUvu', 'ADMIN', false);
INSERT INTO public.users VALUES (2, 'string', 'string', 'string', 'user@example.com', NULL, '$2b$12$0l8gzUKpretytkf896XXKuSRpQksH7fHvMqbelbUqbhMeRP7goelO', 'ADMIN', false);
INSERT INTO public.users VALUES (3, 'string', 'string', 'string', 'dsfgdsfg@example.com', NULL, '$2b$12$EpuRx5paHnR.2Q7Hbp/ziuaMbaN7iDdnZWf0hs0zBz.nKjts9ve5G', 'ADMIN', false);


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: database
--



--
-- Data for Name: locks; Type: TABLE DATA; Schema: public; Owner: database
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: database
--



--
-- Data for Name: rentals; Type: TABLE DATA; Schema: public; Owner: database
--



--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: database
--



--
-- Data for Name: premium_services; Type: TABLE DATA; Schema: public; Owner: database
--



--
-- Name: locks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: database
--

SELECT pg_catalog.setval('public.locks_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: database
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: database
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: premium_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: database
--

SELECT pg_catalog.setval('public.premium_services_id_seq', 1, false);


--
-- Name: rentals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: database
--

SELECT pg_catalog.setval('public.rentals_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: database
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: database
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--


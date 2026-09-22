# Spécification de la Structure du Mémoire de Fin d'Études (BTS)

**Projet :** Application Web de Gestion de la Calibration des Équipements de Mesure et de Métrologie Industrielle  
**Établissement :** INSFP Rahmania - Sidi Abdellah  
**Filière / Option :** Informatique — Développeur Web et Mobile (DWM)  
**Standard :** Guide Mémoire INSFP Rahmania & Exemplaires de Référence (memoir.pdf)  

---

## 1. Plan Général du Document (Document Outline)

### Front Matter (Pages Préliminaires — Numérotation romaine i, ii, iii...)
1. **Page de Garde Officielle (Title Page)** :
   - En-tête officiel à trois colonnes avec les armoiries nationales et logos institutionnels.
   - Thème officiel bilingue (Français & Arabe).
   - Informations administratives : Organisme d'accueil (Laboratoire d'Étalonnage), binôme, encadrant pédagogique, promoteur d'entreprise, promotion académique.
2. **Remerciements (شكر و عرفان)** : Remerciements aux encadrants, jury, professeurs de l'INSFP Rahmania et proches (conforme aux formulations de l'exemplaire `memoir.pdf`).
3. **Dédicaces (إهداء)** : Dédicaces personnelles.
4. **Résumés Tri-lingues (Abstracts & Mots-clés)** :
   - Résumé en Arabe (*ملخص*) + Mots-clés.
   - Résumé en Français (*Résumé*) + Mots-clés.
   - Résumé en Anglais (*Abstract*) + Keywords.
5. **Table des Matières (Sommaire / فهرس المحتويات)**.
6. **Liste des Figures (Table of Figures / فهرس الأشكال)**.
7. **Liste des Tableaux (Table of Tables / فهرس الجداول)**.
8. **Table des Abréviations (Glossaire)** : Sigles normalisés (BTS, INSFP, UML, MVC, RBAC, API, SPA, ORM, NIF, TVA, ISO/IEC 17025).

---

### Introduction Générale (المقدمة العامة — Page 1, Numérotation arabe)
Adaptée directement du modèle officiel `المقدمة العامة.docx` et `memoir.pdf` :
1. **Contexte Général (السياق العام)** : Rôle crucial de la métrologie dans l'industrie moderne, importance de l'étalonnage périodique selon les normes de qualité ISO 17025, transition numérique des processus industriels.
2. **Problématique et Hypothèse de Travail (الإشكالية وفرضية العمل)** :
   - *Problématique :* Les limites des méthodes traditionnelles (fiches papier, tableurs dispersés, risque d'utilisation d'étalons périmés, lenteur de transmission des rapports d'étalonnage).
   - *Hypothèse :* La conception d'une plateforme web centralisée et modulaire assure la traçabilité intégrale, automatise le cycle de vie des demandes, verrouille l'intégrité des certificats et élimine les erreurs humaines.
3. **Objectifs du Projet (أهداف المشروع)** : Numérisation des demandes multi-équipements, routage commercial, planification concertée, affectation technique, immutabilité des certificats finaux, traçabilité d'audit.
4. **Structure du Mémoire (خطة المذكرة)** : Présentation synthétique des quatre chapitres.

---

### Chapitre I : Notions Générales et Fondements Théoriques (الفصل الأول : المفاهيم العامة)
Adapté de `الفصل الاول.docx` :
- **Introduction du Chapitre I**.
- **1.1 Réseaux et Concepts Fondamentaux du Web** : Internet vs Web, protocoles de communication (HTTP/HTTPS, TCP/IP), cycle Requête/Réponse.
- **1.2 Architecture Client-Serveur et Paradigmes Modernes** : Modèle 3-tiers, architectures monolithiques modulaires vs SPA, rôle de la couche de transport Inertia.js.
- **1.3 Technologies et Outils Côté Client (Frontend)** :
  - Langage TypeScript (typage statique, sécurité à la compilation).
  - Bibliothèque React 19 (composants réutilisables, Virtual DOM).
  - Framework CSS Tailwind CSS v4 (utilitaires déclaratifs, responsive design).
  - Outil de build moderne Vite.
- **1.4 Technologies et Outils Côté Serveur (Backend)** :
  - Langage PHP 8.2+ et architecture MVC.
  - Framework Laravel 12/13 (Eloquent ORM, routage, validation, sécurité CSRF/XSS, Middleware).
  - Système de gestion de base de données relationnelle MySQL (ACID, intégrité référentielle).
- **1.5 Sécurité et Modèle d'Habilitation (RBAC)** : Authentification forte, contrôle d'accès basé sur les rôles, gestion des sessions sécurisées.
- **Conclusion du Chapitre I**.

---

### Chapitre II : Étude Préalable et Présentation de l'Organisme d'Accueil (الفصل الثاني : الدراسة التمهيدية)
Adapté de `الفصل الثاني.docx` :
- **Introduction du Chapitre II**.
- **2.1 Présentation de l'Organisme d'Accueil** : Historique, mission du laboratoire de métrologie, domaines d'accréditation technique (Pression, Température, Électricité, Dimensionnel, Pesage, Couple).
- **2.2 Structure Organisationnelle et Organigramme** : Direction générale, service commercial, laboratoire d'étalonnage, service qualité.
- **2.3 Étude de l'Existant et Critique du Système Actuel** : Analyse des flux manuels existants, matrice des faiblesses identifiées (perte de documents, manque de visibilité client, délais de traitement).
- **2.4 Solution Proposée et Spécifications des Besoins** :
  - Besoins fonctionnels (gestion des demandes, devis, exécution métrologique, certificats).
  - Besoins non-fonctionnels (sécurité, temps de réponse, immutabilité légale, ergonomie).
- **2.5 Démarche Méthodologique** : Justification de la méthode unifiée (UP / Unified Process) couplée à UML.
- **Conclusion du Chapitre II**.

---

### Chapitre III : Analyse et Conception Système (الفصل الثالث : التحليل والتصميم)
Conforme aux règles institutionnelles INSFP Rahmania et aux tables de `memoir.pdf` :
- **Introduction du Chapitre III**.
- **3.1 Identification des Acteurs et Diagramme Global des Cas d'Utilisation** :
  - Définition détaillée des 6 acteurs (Client, Commercial, Responsable Métrologie, Technicien Métrologue, Délégué, Administrateur).
  - Diagramme général de cas d'utilisation (TikZ natif).
- **3.2 Fiches Descriptives Détaillées des Cas d'Utilisation (Tables 3.1 à 3.13)** :
  - Table standardisée pour chaque cas d'utilisation majeur : Titre, Acteur principal, Préconditions, Scénario nominal, Scénarios alternatifs, Postconditions.
- **3.3 Modélisation Dynamique (Diagrammes de Séquence)** :
  - Séquence 1 : Authentification et routage de session.
  - Séquence 2 : Soumission d'une demande multi-équipements et qualification commerciale.
  - Séquence 3 : Planification et négociation de date d'intervention.
  - Séquence 4 : Exécution technique, téléversement de rapport et contrôle qualité (rework loop).
  - Séquence 5 : Validation officielle et verrouillage du certificat immuable.
- **3.4 Modélisation des États (Diagramme d'États-Transitions)** :
  - Cycle de vie complet d'une demande de calibration (`DRAFT` $\to$ `SUBMITTED` $\to$ `IN_COMMERCIAL_REVIEW` $\to$ `SCHEDULED` $\to$ `IN_PROGRESS` $\to$ `COMPLETED`).
- **3.5 Conception Logique et Règles Métier** :
  - *Règles de codification :* Format normalisé des références (`REQ-YYYY-XXXX`, `DEV-YYYY-XXXX`, `CERT-YYYY-XXXX`).
  - *Règles de gestion :* Cardinalités et contraintes d'intégrité (1 client possède 0..n demandes, 1 demande contient 1..n équipements, 1 opération produit 1..n rapports et 1 certificat immuable).
- **3.6 Modélisation Structurelle (Diagramme de Classes du Domaine)** :
  - Diagramme de classes UML complet (attributs, types, méthodes, relations de composition et d'association).
  - Tableau récapitulatif des classes et dictionnaire de données des tables clés.
- **3.7 Architecture de Déploiement Physique (Diagramme de Déploiement)** : Topologie LEMP (Linux, Nginx, PHP-FPM, MySQL) sécurisée par SSL/TLS.
- **Conclusion du Chapitre III**.

---

### Chapitre IV : Réalisation, Interfaces et Validation (الفصل الرابع : الإنجاز والاختبارات)
- **Introduction du Chapitre IV**.
- **4.1 Environnement de Développement et Outils Utilisés** : PHP 8.2, Composer, Node.js, Vite, Git, VS Code.
- **4.2 Architecture Logicielle et Organisation du Projet** : Structure modulaire des répertoires Laravel/Inertia/React.
- **4.3 Présentation des Interfaces Utilisateurs Clés** :
  - Portail public et catalogue des services métrologiques.
  - Espace Client : Création d'une demande multi-équipements et consultation des certificats.
  - Espace Commercial : Examen des demandes et validation des devis.
  - Tableau de bord Responsable Métrologie : Pilotage de la charge, planification et validation des certificats.
  - Espace Technicien : Liste des opérations affectées et téléversement du rapport d'étalonnage.
  - Panneau d'administration : Journal d'audit et gestion des étalons de référence.
- **4.4 Validation et Tests Automatisés du Système** :
  - Présentation de la suite de tests Pest / PHPUnit.
  - Matrice des 67 tests automatisés validés à 100% (273 assertions) couvrant l'ensemble du cycle de vie.
- **Conclusion du Chapitre IV**.

---

### Conclusion Générale et Perspectives (الخاتمة العامة والآفاق المستقبلية)
- Synthèse des travaux réalisés et validation des hypothèses de départ.
- Difficultés rencontrées et solutions apportées.
- Perspectives d'évolution : Signature électronique avancée (PKI), application mobile hors-ligne pour techniciens sur site, interfaçage direct avec bancs de mesure connectés (IoT).

---

### Back Matter (Pages Finales)
1. **Bibliographie et Webographie** (Norme académique : 12+ références d'ouvrages, standards ISO et documentations officielles).
2. **Annexes** : Extraits de code clés (middleware de contrôle d'accès, politique d'immutabilité du certificat, migration de base de données).

---

## 2. Manifeste Autoritaire des Diagrammes TikZ (Diagram Manifest)

Tous les diagrammes ci-dessous sont générés au format natif TikZ, sans aucune dépendance logicielle externe, et placés dans `report-template/diagrams/` :

| Numéro Figure | Nom du Fichier | Légende Complète | Type de Modélisation |
| :--- | :--- | :--- | :--- |
| **Fig 1.1** | `tikz-web-arch.tex` | Architecture Client-Serveur 3-Tiers et Protocole HTTP/HTTPS | Schéma d'Architecture |
| **Fig 1.2** | `tikz-inertia-bridge.tex` | Modèle de Communication Inertia.js entre Laravel et React | Schéma de Flux Applicatif |
| **Fig 1.3** | `tikz-rbac-model.tex` | Modèle de Sécurité et Hiérarchie des Rôles (RBAC) | Schéma de Sécurité |
| **Fig 2.1** | `tikz-org-chart.tex` | Organigramme Fonctionnel de l'Organisme d'Accueil | Organigramme Hiérarchique |
| **Fig 2.2** | `tikz-process-comparison.tex` | Comparaison Synoptique entre l'Ancien Flux et le Nouveau Système | Schéma Comparatif |
| **Fig 3.1** | `tikz-uc-general.tex` | Diagramme Global des Cas d'Utilisation du Système | UML Use Case |
| **Fig 3.2** | `tikz-seq-auth.tex` | Diagramme de Séquence : Authentification et Contrôle d'Accès | UML Sequence |
| **Fig 3.3** | `tikz-seq-request.tex` | Diagramme de Séquence : Soumission et Examen Commercial | UML Sequence |
| **Fig 3.4** | `tikz-seq-calibration.tex` | Diagramme de Séquence : Exécution, Téléversement et Revue Qualité | UML Sequence |
| **Fig 3.5** | `tikz-seq-certificate.tex` | Diagramme de Séquence : Validation Immuable et Téléchargement | UML Sequence |
| **Fig 3.6** | `tikz-state-request.tex` | Diagramme d'États-Transitions du Cycle de Vie d'une Demande | UML State Machine |
| **Fig 3.7** | `tikz-class-domain.tex` | Diagramme de Classes UML du Domaine Métrologique | UML Class Diagram |
| **Fig 3.8** | `tikz-db-cluster.tex` | Schéma Relationnel et Architecture de Base de Données | Schéma Relationnel |
| **Fig 3.9** | `tikz-deployment.tex` | Diagramme de Déploiement Physique de la Plateforme (LEMP) | UML Deployment |
| **Fig 4.1** | `tikz-app-structure.tex` | Structure Modulaire des Répertoires et Flux de Contrôle | Schéma d'Architecture Logicielle |
| **Fig 4.2** | `tikz-testing-pyramid.tex` | Pyramide des Tests et Métriques de Validation Automatisée | Schéma de Validation |

---

## 3. Plan de Numérotation des Cas d'Utilisation et Tableaux (Tab 3.X)

| Numéro Tableau | Identifiant | Désignation du Cas d'Utilisation | Acteurs Associés |
| :--- | :--- | :--- | :--- |
| **Tab 3.1** | `UC01` | Authentification et Sécurisation de Session | Tous les acteurs |
| **Tab 3.2** | `UC02` | Consultation du Catalogue Métrologique | Client, Public |
| **Tab 3.3** | `UC03` | Création et Soumission d'une Demande Multi-Équipements | Client |
| **Tab 3.4** | `UC04` | Qualification Commerciale et Émission de Devis | Commercial |
| **Tab 3.5** | `UC05` | Négociation et Validation de la Date d'Intervention | Responsable Métrologie, Client |
| **Tab 3.6** | `UC06` | Affectation Technique de l'Opération de Mesure | Responsable Métrologie |
| **Tab 3.7** | `UC07` | Prise en Charge et Exécution de l'Étalonnage | Technicien Métrologue |
| **Tab 3.8** | `UC08` | Téléversement du Rapport Technique d'Essai | Technicien Métrologue |
| **Tab 3.9** | `UC09` | Contrôle Qualité, Approbation et Demande de Rework | Responsable Métrologie |
| **Tab 3.10** | `UC10` | Génération et Validation du Certificat de Calibration | Responsable Métrologie / Délégué |
| **Tab 3.11** | `UC11` | Consultation et Téléchargement Sécurisé du Certificat | Client |
| **Tab 3.12** | `UC12` | Gestion des Étalons de Référence et Alertes de Validité | Responsable Métrologie, Admin |
| **Tab 3.13** | `UC13` | Traçabilité Intégrale et Piste d'Audit | Administrateur, Responsable |

---

## 4. Règles de Gestion et Codification (3.5)

### Format des Identifiants Uniques
- **Demande de calibration :** `REQ-[ANNEE]-[SEQUENCE_4_CHIFFRES]` (Exemple : `REQ-2026-0042`)
- **Devis commercial :** `DEV-[ANNEE]-[SEQUENCE_4_CHIFFRES]` (Exemple : `DEV-2026-0042`)
- **Contrat client :** `CTR-[ANNEE]-[SEQUENCE_4_CHIFFRES]` (Exemple : `CTR-2026-0008`)
- **Certificat d'étalonnage :** `CERT-[DOMAINE]-[ANNEE]-[SEQUENCE_5_CHIFFRES]` (Exemple : `CERT-PRES-2026-00128`)
- **Étalon de référence :** `ETL-[DOMAINE]-[NUMERO_SERIE]` (Exemple : `ETL-PRES-WIKA-01`)

### Règles d'Intégrité et Contraintes Métier
1. **RG1 (Multi-équipements) :** Une demande d'étalonnage doit contenir au moins un équipement de mesure valide (`1..*`).
2. **RG2 (Concertation de date) :** Une opération ne peut être affectée à un technicien que si la date proposée a été formellement validée par le client.
3. **RG3 (Qualification métrologue) :** Le technicien affecté à une opération doit posséder la qualification requise pour le domaine physique concerné.
4. **RG4 (Contrôle rework) :** Tout rejet d'un rapport de calibration par le responsable exige obligatoirement un motif technique explicatif et entraîne une réaffectation au technicien.
5. **RG5 (Immutabilité du certificat) :** Dès qu'un certificat d'étalonnage est validé (`is_final = true`), il devient strictement immuable en base de données. Toute modification ultérieure est formellement bloquée au niveau des modèles et contrôleurs.
6. **RG6 (Délégation tracée) :** Lorsqu'un technicien délégué valide un certificat en remplacement du responsable, son identité et la date de signature sont inscrites de manière inaltérable dans la piste d'audit.
7. **RG7 (Alerte étalons) :** Tout étalon de référence dont la date d'échéance d'étalonnage est dépassée (`expiration_date < NOW()`) est automatiquement marqué comme périmé et ne peut être associé à une nouvelle opération.

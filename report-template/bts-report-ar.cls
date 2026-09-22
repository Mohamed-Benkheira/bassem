%% bts-report-ar.cls
%% Custom LaTeX class for BTS academic reports in Arabic
%% Conforming to INSFP Rahmania standards and official exemplars (memoir.pdf)
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{bts-report-ar}[2026/09/22 BTS Arabic Report Class]

\LoadClass[a4paper,12pt,openany]{report}

%% ============================================================
%% REQUIRED PACKAGES
%% ============================================================
\RequirePackage{geometry}
\geometry{a4paper, top=2.5cm, bottom=2.5cm, right=2.5cm, left=2.5cm}
\providecommand{\og}{``}
\providecommand{\fg}{''}

\RequirePackage{fontspec}
\RequirePackage{graphicx}
\RequirePackage{float}
\RequirePackage{tabularx}
\RequirePackage{array}
\RequirePackage{booktabs}
\RequirePackage{enumitem}
\RequirePackage{multirow}
\RequirePackage{amsmath}
\RequirePackage{amssymb}
\RequirePackage[table]{xcolor}
\RequirePackage{hyperref}
\RequirePackage{caption}
\RequirePackage{environ}
\RequirePackage{setspace}
\RequirePackage{seqsplit}
\RequirePackage{tikz}
\usetikzlibrary{positioning,calc,fit,shapes.geometric,shapes.multipart,backgrounds,arrows.meta}
\RequirePackage{bidi}

\setmainfont{Amiri}[Script=Arabic]

%% ============================================================
%% COLOR DEFINITIONS
%% ============================================================
\definecolor{chaptercolor}{RGB}{0,0,0}
\definecolor{sectioncolor}{RGB}{25,25,25}
\definecolor{linkcolor}{RGB}{9,74,138}
\definecolor{tableheader}{RGB}{30,41,59}
\definecolor{tablealt}{RGB}{241,245,249}

\hypersetup{
  colorlinks=true,
  linkcolor=linkcolor,
  citecolor=linkcolor,
  urlcolor=linkcolor,
  pdftitle={مذكرة تخرج - تقني سامي},
  pdfauthor={Bassem},
}

%% ============================================================
%% ARABIC CAPTION & HEADING NAMES
%% ============================================================
\renewcommand{\contentsname}{فهرس المحتويات}
\renewcommand{\listfigurename}{فهرس الأشكال}
\renewcommand{\listtablename}{فهرس الجداول}
\renewcommand{\figurename}{الشكل}
\renewcommand{\tablename}{الجدول}
\renewcommand{\chaptername}{الفصل}
\renewcommand{\bibname}{قائمة المراجع والمصادر}
\renewcommand{\appendixname}{الملاحق}

\setlength{\parindent}{1.5em}
\setlength{\parskip}{6pt}
\setstretch{1.3}
\emergencystretch=1.5em
\tolerance=2000

%% ============================================================
%% METADATA COMMANDS
%% ============================================================
\newcommand{\bts@republic}{الجمهورية الجزائرية الديمقراطية الشعبية}
\newcommand{\bts@ministry}{وزارة التكوين والتعليم المهنيين}
\newcommand{\bts@institute}{المعهد الوطني المتخصص في التكوين المهني}
\newcommand{\bts@location}{رحمانية - سيدي عبد الله}
\newcommand{\bts@diploma}{مذكرة تخرج لنيل شهادة تقني سامي}
\newcommand{\bts@field}{مطور الويب والوسائط المتنقلة \LR{(D\'eveloppeur Web et Mobile)}}

\newcommand{\bts@themeAr}{}
\newcommand{\themeAr}[1]{\renewcommand{\bts@themeAr}{#1}}

\newcommand{\bts@themeFr}{}
\newcommand{\themeFr}[1]{\renewcommand{\bts@themeFr}{#1}}

\newcommand{\bts@hostorg}{}
\newcommand{\hostorg}[1]{\renewcommand{\bts@hostorg}{#1}}

\newcommand{\bts@supervisor}{}
\newcommand{\supervisor}[1]{\renewcommand{\bts@supervisor}{#1}}

\newcommand{\bts@promoter}{}
\newcommand{\promoter}[1]{\renewcommand{\bts@promoter}{#1}}

\newcommand{\bts@students}{}
\newcommand{\students}[1]{\renewcommand{\bts@students}{#1}}

\newcommand{\bts@promotion}{}
\newcommand{\promotion}[1]{\renewcommand{\bts@promotion}{#1}}

%% ============================================================
%% TITLE PAGE
%% ============================================================
\newcommand{\maketitlepage}{
  \begin{titlepage}
    \centering
    \vspace*{-1cm}

    \noindent
    \begin{minipage}[c]{0.20\textwidth}
        \centering
        \includegraphics[width=0.85\linewidth]{figures/first-logo.jpg}
    \end{minipage}%
    \hfill
    \begin{minipage}[c]{0.56\textwidth}
        \centering
        {\large\bfseries \bts@republic\par}
        \vspace{0.2cm}
        {\large \bts@ministry\par}
        \vspace{0.15cm}
        {\large \bts@institute\par}
        \vspace{0.15cm}
        {\large \bts@location\par}
    \end{minipage}%
    \hfill
    \begin{minipage}[c]{0.20\textwidth}
        \centering
        \includegraphics[width=0.85\linewidth]{figures/second-logo.png}
    \end{minipage}

    \vspace{1.2cm}
    {\Large\textbf{\bts@diploma}\par}
    \vspace{0.2cm}
    {\large \textbf{تخصص : }\bts@field\par}
    \vspace{0.8cm}

    {\LARGE\textbf{الموضوع :}\par}
    \vspace{0.4cm}
    {\Large\bfseries \color{linkcolor} \bts@themeAr\par}
    \vspace{0.3cm}
    {\normalsize\itshape \begin{LTR}\centering \bts@themeFr \end{LTR}\par}
    \vspace{0.8cm}

    {\large \textbf{المؤسسة المستخدمة (المستفيدة) : } \bts@hostorg\par}
    \vspace{1.2cm}

    \noindent
    \begin{minipage}[t]{0.48\textwidth}
      \begin{flushright}
        \textbf{من إعداد المتربص :} \\[0.2cm]
        \bts@students
      \end{flushright}
    \end{minipage}%
    \hfill
    \begin{minipage}[t]{0.48\textwidth}
      \begin{flushleft}
        \textbf{المشرفة في المعهد :} \\[0.2cm]
        \bts@supervisor \\[0.6cm]
        \textbf{المؤطر في المؤسسة المستخدمة :} \\[0.2cm]
        \bts@promoter
      \end{flushleft}
    \end{minipage}

    \vfill
    {\large \textbf{الدفعة : } \bts@promotion\par}
  \end{titlepage}
}

%% ============================================================
%% FRONT MATTER ENVIRONMENTS
%% ============================================================
\newenvironment{shokr}{%
  \chapter*{شكر و عرفان}
  \addcontentsline{toc}{chapter}{شكر و عرفان}
}{%
}

\newenvironment{ihda}{%
  \chapter*{إهداء}
  \addcontentsline{toc}{chapter}{إهداء}
}{%
}

\newenvironment{abstractar}{%
  \chapter*{ملخص}
  \addcontentsline{toc}{chapter}{ملخص}
}{%
}

\newenvironment{abstractfr}{%
  \chapter*{R\'esum\'e}
  \addcontentsline{toc}{chapter}{R\'esum\'e}
  \begin{LTR}
}{%
  \end{LTR}
}

\newenvironment{abstracten}{%
  \chapter*{Abstract}
  \addcontentsline{toc}{chapter}{Abstract}
  \begin{LTR}
}{%
  \end{LTR}
}

%% ============================================================
%% CUSTOM TABLES
%% ============================================================
\NewEnviron{usecasetablear}[1]{%
  \begin{table}[H]
    \centering
    \caption{#1}
    \vspace{0.2cm}
    \begin{tabularx}{\textwidth}{|>{\bfseries}p{3.8cm}|X|}
      \hline
      \rowcolor{tableheader}
      \textcolor{white}{\textbf{الحقل}} & \textcolor{white}{\textbf{الوصف والمسار}} \\
      \hline
      \BODY
      \hline
    \end{tabularx}
  \end{table}
}

\newcommand{\ucfieldar}[2]{%
  #1 & \parbox[t]{\linewidth}{#2\vspace{2pt}} \\
  \hline
}

\NewEnviron{dbtablear}[1]{%
  \begin{table}[H]
    \centering
    \caption{#1}
    \vspace{0.2cm}
    \begin{tabularx}{\textwidth}{|>{\small}p{4.6cm}|>{\small}p{2.6cm}|p{1.4cm}|X|}
      \hline
      \rowcolor{tableheader}
      \textcolor{white}{\textbf{الحقل \LR{(Column)}}} & \textcolor{white}{\textbf{النوع \LR{(Type)}}} & \textcolor{white}{\textbf{يقبل فراغ}} & \textcolor{white}{\textbf{الوصف}} \\
      \hline
      \BODY
      \hline
    \end{tabularx}
  \end{table}
}

\newcommand{\dbcolar}[4]{%
  \LR{\small\texttt{\seqsplit{#1}}} & \LR{\small\texttt{\seqsplit{#2}}} & #3 & #4 \\
  \hline
}

\NewEnviron{teststablear}[1]{%
  \begin{table}[H]
    \centering
    \caption{#1}
    \vspace{0.2cm}
    \begin{tabularx}{\textwidth}{|>{\bfseries}p{4.5cm}|p{2cm}|p{2cm}|X|}
      \hline
      \rowcolor{tableheader}
      \textcolor{white}{\textbf{صنف الاختبار}} & \textcolor{white}{\textbf{العدد}} & \textcolor{white}{\textbf{الناجحة}} & \textcolor{white}{\textbf{الحالة}} \\
      \hline
      \BODY
      \hline
    \end{tabularx}
  \end{table}
}

\newcommand{\testrowar}[4]{%
  #1 & #2 & #3 & \LR{#4} \\
  \hline
}

\NewEnviron{abbrevtablear}{%
  \begin{table}[H]
    \centering
    \begin{tabularx}{\textwidth}{|>{\bfseries}p{3.5cm}|X|}
      \hline
      \rowcolor{tableheader}
      \textcolor{white}{\textbf{الاختصار \LR{(Sigle)}}} & \textcolor{white}{\textbf{الدلالة والشرح}} \\
      \hline
      \BODY
      \hline
    \end{tabularx}
  \end{table}
}

\NewEnviron{codiftablear}[1]{%
  \begin{table}[H]
    \centering
    \caption{#1}
    \vspace{0.2cm}
    \begin{tabularx}{\textwidth}{|>{\bfseries}p{4.2cm}|X|p{4cm}|}
      \hline
      \rowcolor{tableheader}
      \textcolor{white}{\textbf{العنصر}} & \textcolor{white}{\textbf{الدلالة}} & \textcolor{white}{\textbf{مثال}} \\
      \hline
      \BODY
      \hline
    \end{tabularx}
  \end{table}
}

\newcommand{\codifrowar}[3]{%
  \LR{\small\texttt{\seqsplit{#1}}} & #2 & \LR{\small\texttt{\seqsplit{#3}}} \\
  \hline
}

\NewEnviron{summarytablear}[1]{%
  \begin{table}[H]
    \centering
    \caption{#1}
    \vspace{0.2cm}
    \begin{tabularx}{\textwidth}{|>{\bfseries}p{3.6cm}|X|p{4.2cm}|}
      \hline
      \rowcolor{tableheader}
      \textcolor{white}{\textbf{الفئة}} & \textcolor{white}{\textbf{الخواص \LR{(Attributs)}}} & \textcolor{white}{\textbf{الأساليب \LR{(M\'ethodes)}}} \\
      \hline
      \BODY
      \hline
    \end{tabularx}
  \end{table}
}

\newcommand{\summaryrowar}[3]{%
  \LR{\small\texttt{\seqsplit{#1}}} & #2 & #3 \\
  \hline
}

\NewEnviron{relmapar}[1]{%
  \begin{table}[H]
    \centering
    \caption{#1}
    \vspace{0.2cm}
    \begin{tabularx}{\textwidth}{|>{\bfseries}p{2.9cm}|>{\small}p{3.2cm}|p{2.1cm}|p{2.4cm}|X|}
      \hline
      \rowcolor{tableheader}
      \textcolor{white}{\textbf{صنف UML}} & \textcolor{white}{\textbf{جدول SQL}} & \textcolor{white}{\textbf{المفتاح الأساسي PK}} & \textcolor{white}{\textbf{مفاتيح أجنبية FK}} & \textcolor{white}{\textbf{ملاحظات}} \\
      \hline
      \BODY
      \hline
    \end{tabularx}
  \end{table}
}

\newcommand{\relmaprow}[5]{%
  \LR{\small\texttt{\seqsplit{#1}}} & \LR{\small\texttt{\seqsplit{#2}}} & \LR{\small\texttt{\seqsplit{#3}}} & \LR{\small\texttt{\seqsplit{#4}}} & #5 \\
  \hline
}

\NewEnviron{pivotar}[1]{%
  \begin{table}[H]
    \centering
    \caption{#1}
    \vspace{0.2cm}
    \begin{tabularx}{\textwidth}{|>{\small}p{4.4cm}|p{3.2cm}|p{2.4cm}|X|}
      \hline
      \rowcolor{tableheader}
      \textcolor{white}{\textbf{العلاقة}} & \textcolor{white}{\textbf{جدول الربط \LR{(Pivot)}}} & \textcolor{white}{\textbf{المفاتيح \LR{(FK)}}} & \textcolor{white}{\textbf{ملاحظات}} \\
      \hline
      \BODY
      \hline
    \end{tabularx}
  \end{table}
}

\newcommand{\pivotrow}[4]{%
  #1 & \LR{\small\texttt{\seqsplit{#2}}} & \LR{\small\texttt{\seqsplit{#3}}} & #4 \\
  \hline
}

\endinput

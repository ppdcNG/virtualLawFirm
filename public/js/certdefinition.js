// playground requires you to assign document definition to a variable called dd

var dd = {
    pageSize: 'A4',

    // by default we use portrait, you can change it to landscape if you wish
    pageOrientation: 'landscape',

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins: [0, 0],
    watermark: { text: 'Lawtrella', color: '#9C8282', opacity: 0.2, margin: [100, 50], bold: true, italics: false },

    content: [
        {
            table: {
                widths: [190, "*"],

                body: [
                    [{
                        svg: `<svg width="243" height="742" viewBox="0 0 243 742" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="243" height="2480" fill="#3BD1C7"/>
                        <g clip-path="url(#clip0)">
                        <path d="M184.528 602.975L198.719 589.087C202.949 585.082 200.976 577.965 195.428 576.638L176.094 571.704L181.544 552.566C183.085 547.062 177.894 541.87 172.391 543.41L153.26 548.862L148.328 529.522C147.022 524.06 139.826 522.063 135.884 526.23L122 540.531L108.117 526.23C104.219 522.11 96.9928 523.998 95.6726 529.523L90.7401 548.862L71.6088 543.411C66.1044 541.869 60.9157 547.063 62.4556 552.567L67.9057 571.704L48.5723 576.639C43.0213 577.966 41.0528 585.084 45.2811 589.087L59.4718 602.975L45.2811 616.863C41.0509 620.868 43.0234 627.984 48.572 629.311L67.9054 634.246L62.4553 653.383C60.9151 658.888 66.1056 664.08 71.6085 662.539L90.7394 657.087L95.672 676.427C97.0419 682.16 104.219 683.839 108.116 679.719L122 665.524L135.883 679.719C139.741 683.882 146.989 682.03 148.327 676.427L153.26 657.087L172.391 662.539C177.895 664.081 183.084 658.887 181.544 653.383L176.094 634.246L195.427 629.311C200.978 627.984 202.947 620.866 198.718 616.863L184.528 602.975V602.975Z" fill="#C8F2EF"/>
                        </g>
                        <g clip-path="url(#clip1)">
                        <path d="M109.721 525.754L84.4728 483.676C83.4346 481.945 81.9659 480.512 80.2095 479.517C78.4532 478.523 76.4692 478 74.4507 478H33.8549C29.1251 478 26.3567 483.321 29.0667 487.197L69.7063 545.254C80.5611 535.112 94.367 528.15 109.721 525.754ZM209.146 478H168.55C164.444 478 160.639 480.155 158.528 483.676L133.279 525.754C148.633 528.15 162.439 535.112 173.294 545.251L213.934 487.197C216.644 483.321 213.875 478 209.146 478ZM121.5 536.438C85.9994 536.438 57.219 565.218 57.219 600.719C57.219 636.22 85.9994 665 121.5 665C157.001 665 185.781 636.22 185.781 600.719C185.781 565.218 157.001 536.438 121.5 536.438ZM155.292 593.874L141.438 607.373L144.715 626.446C145.299 629.864 141.698 632.476 138.633 630.862L121.5 621.859L104.371 630.862C101.303 632.487 97.7052 629.861 98.2896 626.446L101.566 607.373L87.7124 593.874C85.2215 591.449 86.5984 587.216 90.0316 586.719L109.181 583.929L117.738 566.573C118.509 565.01 119.999 564.239 121.493 564.239C122.994 564.239 124.495 565.021 125.266 566.573L133.823 583.929L152.972 586.719C156.406 587.216 157.783 591.449 155.292 593.874V593.874Z" fill="#EA9216"/>
                        </g>
                        <defs>
                        <clipPath id="clip0">
                        <rect width="158" height="158" fill="white" transform="translate(43 524)"/>
                        </clipPath>
                        <clipPath id="clip1">
                        <rect width="187" height="187" fill="white" transform="translate(28 478)"/>
                        </clipPath>
                        </defs>
                        </svg>`,
                        fit: [195, 589]
                    },
                    {
                        fillColor: "#f1e6d6",
                        stack: [
                            {
                                text: 'Certificate of Completion',
                                style: "cursive"
                            },
                            {
                                text: 'This certificate is awarded to',
                                style: "awardee"
                            },
                            {
                                text: 'ADEKUNLE ADELOWO',
                                style: 'name'
                            },
                            {
                                text: [
                                    'Having completed all course ware for the Lawtrella online  course ',
                                    { text: ' Introduction to contract Law', bold: true }
                                ],
                                style: "course"

                            },
                            {
                                columns: [
                                    {
                                        stack: [
                                            { text: "Date Awarded" },
                                            { text: "19 June 2020", style: "boldFooter" }
                                        ],
                                        margin: [30, 0]
                                    },
                                    {
                                        stack: [
                                            {
                                                text: "Course Author",
                                            },
                                            {
                                                text: "A and E Law Partnership",
                                                style: "boldFooter"
                                            }
                                        ],
                                        alignment: 'right',
                                        margin: [30, 0]
                                    }
                                ],
                                margin: [0, 120, 0, 0]
                            }
                        ]
                    }]
                ]
            }
        },

    ],
    styles: {
        header: {
            fontSize: 18,
            bold: true
        },
        bigger: {
            fontSize: 15,
            italics: true
        },
        cursive: {
            fontSize: 28,
            margin: [0, 120, 0, 20],
            alignment: "center"
        },
        awardee: {
            fontSize: 14,
            alignment: "center"
        },
        name: {
            fontSize: 42,
            alignment: "center",
            bold: true,
            margin: [0, 30, 0, 30]
        },
        course: {
            fontSize: 18,
            alignment: "center",
            margin: [120, 0],
            color: "#897575"

        },
        boldFooter: {
            fontSize: 14,
            bold: true,
            margin: [0, 10]
        }
    },
    defaultStyle: {

    }

}
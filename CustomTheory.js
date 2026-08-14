import { ConstantCost, ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { Thickness } from "./api/ui/properties/Thickness";
import { Color } from "./api/ui/properties/Color";

var id = "revitalize_of_black_hole";
var name = "Revitalize of Black Hole";
var description = "A basic theory.";
var authors = "Tomster - Coder\nfien012 - Idea && Tester";
var version = 1;

var currency;
var E1, dt, mi, gamma;
var E1nowLevel = 0;
//constant
var G = BigNumber.from(6.674) * BigNumber.TEN.pow(-11), c = BigNumber.from(2.99792458) * BigNumber.TEN.pow(8), planck = BigNumber.from(1.055) * BigNumber.TEN.pow(-34), K = BigNumber.from(3.9628) * BigNumber.TEN.pow(15);
var EVal = BigNumber.ZERO, t = BigNumber.ZERO, M = BigNumber.TEN.pow(12), Cn = BigNumber.ZERO;

var numberFormat = (value, decimals, negExpFlag=false) => {
    if (value >= BigNumber.ZERO)
    {
        if (value >= BigNumber.from(0.1) || value == BigNumber.ZERO) 
        {
            if (value > BigNumber.ZERO && value < BigNumber.ONE && decimals < 3)
            {
                return value.toString(3);
            }
            return value.toString(decimals);
        }
        else
        {
            let exp = Math.floor((value*BigNumber.from(1+1e-5)).log10().toNumber());
            let mts = (value * BigNumber.TEN.pow(-exp)).toString(decimals);
            if (exp > 0 || !negExpFlag)
            {
                return `${mts}e${exp}`;
            }
            else
            {
                return `${mts}e$\\,-$${-exp}`;
            }
        }
    }
    else
    {
        value = -value;
        if (value >= BigNumber.from(0.1) || value == BigNumber.ZERO) 
        {
            return (-value).toString(decimals);
        }
        else
        {
            let exp = Math.floor((value*BigNumber.from(1+1e-5)).log10().toNumber());
            let mts = (value * BigNumber.TEN.pow(-exp)).toString(decimals);
            return `-${mts}e${exp}`;
        }
    }
}

var init = () => {
    currency = theory.createCurrency();
    ///////////////////
    // Regular Upgrades

    // E1
    {
        E1 = theory.createSingularUpgrade(0, currency, new ConstantCost(BigNumber.TEN));
        E1.getDescription = (_) => Utils.getMath("E \\uparrow " + getE(1));
        E1.getInfo = (amount) => "E increase by " + getE(1);
    }

    // dt
    {
        let getDesc = (level) => "dt=" + getDT(level).toString();
        dt = theory.createUpgrade(0, currency, new FirstFreeCost(new ConstantCost(BigNumber.ONE)));
        dt.maxLevel = 1;
        dt.getDescription = (_) => Utils.getMath(getDesc(dt.level));
        dt.getInfo = (amount) => Utils.getMathTo(getDesc(dt.level), getDesc(dt.level + amount));
    }

    // mi
    {
        let getDesc = (level) => `\\mu = ${getMI(level).toString()}`;
        mi = theory.createUpgrade(1, currency, new ExponentialCost(BigNumber.FIVE, BigNumber.from(1.18).log2()));
        mi.getDescription = (_) => Utils.getMath(getDesc(mi.level));
        mi.getInfo = (amount) => Utils.getMathTo(getDesc(mi.level), getDesc(mi.level + amount));
    }

    // gamma
    {
        let getDesc = (level) => `\\gamma = ${getGAMMA(level).toString()}`;
        gamma = theory.createUpgrade(2, currency, new ExponentialCost(BigNumber.TEN.pow(2), BigNumber.TEN.pow(2).log2()));
        gamma.maxLevel = 16;
        gamma.getDescription = (_) => Utils.getMath(getDesc(gamma.level));
        gamma.getInfo = (amount) => Utils.getMathTo(getDesc(gamma.level), getDesc(gamma.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));


    updateAvailability();
}

var updateAvailability = () => {
    
}

var tick = (elapsedTime, multiplier) => {
    let realTime = BigNumber.from(elapsedTime * multiplier);
    if (M == 0) {
        realTime = 0;
    }
    let time = realTime * getDT(dt.level);
    let bonus = theory.publicationMultiplier;

    let P1 = (BigNumber.from(81) * c.pow(3) / (BigNumber.from(32) * G)) * (EVal / (M + BigNumber.ONE));
    let P2 = BigNumber.from(6.321) * M;
    let P_abs = P1.min(P2);
    let E_drained = EVal.min(P_abs * time);
    let dE = - E_drained;

    let dM = getMI(mi.level) * (BigNumber.ONE - getGAMMA(gamma.level)) * -dE / c.pow(2) - time * K / (BigNumber.ONE + M.pow(2));

    if (dt.level > 0) {
        M += dM;
        M = M.max(BigNumber.ZERO);

        EVal += dE;

        t += realTime;

        currency.value += realTime * M / BigNumber.TEN.pow(11);

        if (E1.level > E1nowLevel) {
            EVal += (E1.level - E1nowLevel) * BigNumber.TEN.pow(28);
            E1nowLevel = E1.level;
        }
    }

    theory.invalidateQuaternaryValues();
    theory.invalidateTertiaryEquation();
}

//Equation
var getInternalState = () => `${EVal} ${t} ${M} ${Cn}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) EVal = parseBigNumber(values[0]);
    if (values.length > 1) t = parseBigNumber(values[1]);
    if (values.length > 2) M = parseBigNumber(values[2]);
    if (values.length > 3) Cn = parseBigNumber(values[3]);
}

var getPrimaryEquation = () => {
    let result = "";
    let scale = 1.1;
    result += "\\dot{\\rho} = \\frac{M}{10^{11}} \\\\\\\\";
    result += "\\frac{dE}{dt} = -\\min\\left(E,P_{abs}\\right) \\\\\\\\";
    result += "\\frac{dM}{dt} = -\\frac{dE}{dt} \\cdot \\frac{\\mu (1 - \\gamma)}{c^2} - \\frac{K}{M^2 + 1}";
    theory.primaryEquationScale = scale;
    theory.primaryEquationHeight = 150 * scale;
    return "\\begin{matrix}" + result + "\\end{matrix}";
}

var getQuaternaryEntries = () => {
    let quaternaryEntries = [];
    let flagAll = quaternaryEntries.length == 0;
    if (flagAll) {
        quaternaryEntries.push(new QuaternaryEntry("E", null));
        quaternaryEntries.push(new QuaternaryEntry("M", null));
        quaternaryEntries.push(new QuaternaryEntry("r_s", null));
        quaternaryEntries.push(new QuaternaryEntry("t", null));
        quaternaryEntries.push(new QuaternaryEntry("t_r", null));
    }
    quaternaryEntries[0].value = EVal.toString();
    quaternaryEntries[1].value = M.toString();
    let rs = BigNumber.TWO * G * M / c.pow(2);
    quaternaryEntries[2].value = numberFormat(rs, 2);
    quaternaryEntries[3].value = (t * getDT(dt.level)).toString();
    quaternaryEntries[4].value = t.toString();
    return quaternaryEntries;
}

var getTertiaryEquation = () => {
    let result = "";
    let tEvap = M.pow(BigNumber.THREE) / (BigNumber.THREE * K);
    result += "T_{evap} = " + numberFormat(tEvap / getDT(dt.level), 2);
    return result;
}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho";

var getEquationOverlay = () => {
    let button1 = ui.createButton({
        text: "?",
        fontSize: 40,
        textColor: Color.TEXT,
        backgroundColor: Color.TRANSPARENT,
        borderColor: Color.TRANSPARENT,
        widthRequest: 50,
        heightRequest: 50,
        horizontalOptions: LayoutOptions.START_AND_EXPAND,
        verticalOptions: LayoutOptions.END_AND_EXPAND,
        onPressed: () => {
            button1.textColor = Color.TEXT_DARK
        },
        onReleased: () => {
            button1.textColor = Color.TEXT
            let popup = ui.createPopup({
                        title: "Constant & Info",
                        content: ui.createStackLayout({
                            children: [
                                // --- 1. CÁC CÔNG THỨC P1, P2, P_abs ---
                                ui.createLatexLabel({
                                    text: Utils.getMath("P_1 = \\frac{81 c^3 E}{32 G (M + 1)}"),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath("P_2 = 6.321 M"),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath("P_{\\text{abs}} = \\min(P_1, P_2)"),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),

                                // Dòng kẻ phân cách nhỏ cho đẹp mắt
                                ui.createBox({
                                    heightRequest: 1,
                                    backgroundColor: Color.TEXT,
                                    margin: new Thickness(0, 10)
                                }),

                                // --- 2. CÁC HẰNG SỐ VẬT LÝ ---
                                ui.createLatexLabel({
                                    text: Utils.getMath("G = " + numberFormat(G, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath("c = " + numberFormat(c, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath("\\hbar = " + numberFormat(planck, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath("K = " + numberFormat(K, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                })
                            ]
                        })
                    });
            popup.show();
        },
    });

    let button2 = ui.createButton({
        text: "꥟",
        fontSize: 40,
        textColor: Color.TEXT,
        backgroundColor: Color.TRANSPARENT,
        borderColor: Color.TRANSPARENT,
        widthRequest: 50,
        heightRequest: 50,
        horizontalOptions: LayoutOptions.START_AND_EXPAND,
        verticalOptions: LayoutOptions.START_AND_EXPAND,
        onPressed: () => {
            button2.textColor = Color.TEXT_DARK
        },
        onReleased: () => {
            button2.textColor = Color.TEXT
            let popup = ui.createPopup({
                        title: "Collapse Info",
                        content: ui.createStackLayout({
                            children: [
                                ui.createLatexLabel({
                                    text: Utils.getMath("\\text{Collapses: } " + numberFormat(Cn, 0)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),

                                // Dòng kẻ phân cách nhỏ cho đẹp mắt
                                ui.createBox({
                                    heightRequest: 1,
                                    backgroundColor: Color.TEXT,
                                    margin: new Thickness(0, 10)
                                }),

                                ui.createLatexLabel({
                                    text: Utils.getMath("\\text{Dark Matter Formula: } " + numberFormat(Cn, 0)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                            ]
                        })
                    });
            popup.show();
        }
    });

    return ui.createStackLayout({
        children: [
            button2, button1
        ]
    });
};

var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

//getValue
var getE = (level) => {
    return level * BigNumber.TEN.pow(28);
}

var getDT = (level) => {
    switch (level) {
        case 1:
            return BigNumber.TEN.pow(18);
        default:
            return BigNumber.ZERO;
    }
}

var getMI = (level) => {
    return BigNumber.TEN.pow(-1) + level * BigNumber.TEN.pow(-2);
}

var getGAMMA = (level) => {
    return (BigNumber.from(0.9) - level / BigNumber.from(20)).max(BigNumber.from(0.1));
}

init();

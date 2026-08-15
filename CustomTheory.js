import { ConstantCost, ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { Thickness } from "./api/ui/properties/Thickness";
import { Color } from "./api/ui/properties/Color";
import { LineBreakMode } from "./api/ui/properties/LineBreakMode";
import { FontFamily } from "./api/ui/properties/FontFamily";
import { FontAttributes } from "./api/ui/properties/FontAttributes";

//class
class Stat {
    constructor(defaultValue) {
        this.value = defaultValue;
        this._default = defaultValue;
    }

    reset() {
        this.value = this._default;
    }
}


var id = "revitalize_of_black_hole";
var name = "Revitalize of Black Hole";
var description = "A basic theory.";
var authors = "Tomster - Coder\nfien012 - Idea && Tester";
var version = 1;

//upgrade
var currency;
var E1, dt, mi, gamma;
var E1nowLevel = 0;

//constant
const G = BigNumber.from(6.674) * BigNumber.TEN.pow(-11), c = BigNumber.from(2.99792458) * BigNumber.TEN.pow(8), planck = BigNumber.from(1.055) * BigNumber.TEN.pow(-34), K = BigNumber.from(3.9628) * BigNumber.TEN.pow(15);

//symbol
var EVal = new Stat(BigNumber.ZERO), 
    t = new Stat(BigNumber.ZERO), 
    M = new Stat(BigNumber.TEN.pow(12)), 
    Cn = new Stat(BigNumber.ZERO),
    DM = new Stat(BigNumber.ZERO)

//dynamicLabel
var dynamicLabel1;

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

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));


    updateAvailability();
}

var updateAvailability = () => {
    
}

var tick = (elapsedTime, multiplier) => {
    //calculate
    let realTime = BigNumber.from(elapsedTime * multiplier);
    if (M.value == 0) {
        realTime = 0;
    }
    let time = TIMEFormula(realTime);
    let bonus = theory.publicationMultiplier;

    let P1 = (BigNumber.from(81) * c.pow(3) / (BigNumber.from(32) * G)) * (EVal.value / (M.value + BigNumber.ONE));
    let P2 = BigNumber.from(6.321) * M.value;
    let P_abs = P1.min(P2);
    let E_drained = EVal.value.min(P_abs * time);
    let dE = - E_drained;

    let dM = getMI(mi.level) * (BigNumber.ONE - getGAMMA(gamma.level)) * -dE / c.pow(2) - time * K / (BigNumber.ONE + M.value.pow(2));

    if (dt.level > 0) {
        M.value += dM;
        M.value = M.value.max(BigNumber.ZERO);

        EVal.value += dE;

        t.value += realTime;

        currency.value += realTime * M.value / BigNumber.TEN.pow(11);

        if (E1.level > E1nowLevel) {
            EVal.value += (E1.level - E1nowLevel) * BigNumber.TEN.pow(28);
            E1nowLevel = E1.level;
        }
    }

    //dynamicLabel
    if (dynamicLabel1) {
        dynamicLabel1.text = Utils.getMath("\\text{You will earn }" + numberFormat(DMFormula(), 3) + "\\text{ Dark Matter\\\\}")
    }

    theory.invalidateQuaternaryValues();
    theory.invalidateTertiaryEquation();
}

//Equation
var getInternalState = () => `${EVal.value} ${t.value} ${M.value} ${Cn.value} ${DM.value}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) EVal.value = parseBigNumber(values[0]);
    if (values.length > 1) t.value = parseBigNumber(values[1]);
    if (values.length > 2) M.value = parseBigNumber(values[2]);
    if (values.length > 3) Cn.value = parseBigNumber(values[3]);
    if (values.length > 4) DM.value = parseBigNumber(values[4]);
}

var getPrimaryEquation = () => {
    let result = "";
    let scale = 1.1;
    result += "\\dot{\\rho} = \\frac{M}{10^{11}} \\\\\\\\";
    result += "\\dot{t} = dt \\cdot \\left(1+DM\\right) \\\\\\\\";
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
    quaternaryEntries[0].value = EVal.value.toString();
    quaternaryEntries[1].value = M.value.toString();
    let rs = BigNumber.TWO * G * M.value / c.pow(2);
    quaternaryEntries[2].value = numberFormat(rs, 2);
    quaternaryEntries[3].value = TIMEFormula(t.value).toString();
    quaternaryEntries[4].value = t.value.toString();
    return quaternaryEntries;
}

var getTertiaryEquation = () => {
    let result = "";
    let tEvap = M.value.pow(BigNumber.THREE) / (BigNumber.THREE * K);
    result += "T_{evap} = " + numberFormat(tEvap / getDT(dt.level), 2);
    result += ", DM = " + numberFormat(DM.value, 3);
    return result;
}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho";

var getEquationOverlay = () => {
    let button1 = ui.createButton({
        text: "?",
        fontSize: 30,
        textColor: Color.TEXT,
        backgroundColor: Color.TRANSPARENT,
        borderColor: Color.TRANSPARENT,
        widthRequest: 40,
        heightRequest: 40,
        horizontalOptions: LayoutOptions.START_AND_EXPAND,
        verticalOptions: LayoutOptions.END_AND_EXPAND,
        onPressed: () => {
            button1.textColor = Color.TEXT_DARK;
        },
        onReleased: () => {
            button1.textColor = Color.TEXT;
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
        text: "⚛",
        fontSize: 30,
        textColor: Color.TEXT,
        backgroundColor: Color.TRANSPARENT,
        borderColor: Color.TRANSPARENT,
        widthRequest: 40,
        heightRequest: 40,
        horizontalOptions: LayoutOptions.START_AND_EXPAND,
        verticalOptions: LayoutOptions.START_AND_EXPAND,
        onPressed: () => {
            button2.textColor = Color.TEXT_DARK;
        },
        onReleased: () => {
            button2.textColor = Color.TEXT;
            dynamicLabel1 = ui.createLatexLabel({
                horizontalTextAlignment: TextAlignment.CENTER
            });
            let popup = ui.createPopup({
                        title: "Collapse",
                        content: ui.createStackLayout({
                            children: [
                                ui.createLatexLabel({
                                    text: Utils.getMath("\\text{Reset your {\\rho}, M, E, t, t_r\\\\ and dt, {\\mu}, {\\gamma} upgrade\\\\}"),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                dynamicLabel1,
                                ui.createButton({
                                    text: "Collapse!",
                                    fontSize: 20,
                                    heightRequest: 35,
                                    onReleased: () => {
                                        collapseReset();
                                    }
                                })
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


//reset_layer
var collapseReset = () => {
    Cn.value++;
    DM.value += DMFormula();
    currency.value = BigNumber.ZERO;
    M.reset();
    EVal.reset();
    t.reset();
    dt.level = 0;
    mi.level = 0;
    gamma.level = 0;
}

//formula
var DMFormula = () => {
    return t.value / 90;
}

var TIMEFormula = (t) => {
    return t * getDT(dt.level) * (BigNumber.ONE + DM.value);
}

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

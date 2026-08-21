import { ConstantCost, ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { Thickness } from "./api/ui/properties/Thickness";
import { Color } from "./api/ui/properties/Color";

//class
class Symbol {
    constructor(normal, latex) {
        this.normal = normal;
        this.latex = latex;
    }

    static create(normal, latex) {
        return new Symbol(normal, latex);
    }
}

class Stat {
    constructor(defaultValue, symbol) {
        this.value = BigNumber.from(defaultValue);
        this._default = BigNumber.from(defaultValue);
        this.symbol = symbol;
    }

    reset() {
        this.value = this._default;
    }
}

class Constant {
    constructor(defaultValue, symbol) {
        this.value = defaultValue;
        this.symbol = symbol;
    }
}

class Upgrade {
    constructor(upgrade, symbol, getValue, getDesc = null) {
        this.upgrade = upgrade;
        this.symbol = symbol;
        this._getValue = getValue;
        if (getValue) {
            if (getDesc == null) getDesc = (level) => `${symbol.latex} = ${getValue(level).toString()}`;
            this.upgrade.getDescription = (_) => Utils.getMath(getDesc(this.upgrade.level));
            this.upgrade.getInfo = (amount) => Utils.getMathTo(
                getDesc(this.upgrade.level), 
                getDesc(this.upgrade.level + amount)
            );
        }
    }

    get value() {
        return BigNumber.from(this._getValue(this.upgrade.level));
    }

    reset() {
        this.upgrade.level = 0;
    }
}


var id = "revitalize_of_black_hole";
var name = "Revitalize of Black Hole";
var description = "A basic theory.";
var authors = "Tomster - Coder\nfien012 - Idea && Tester";
var version = 1;

//currency
var currency, darkMatter;

//upgrade
var E1, startTheory, mi, gamma,
    omega;

//constant
const G = new Constant(BigNumber.from(6.674) * BigNumber.TEN.pow(-11), Symbol.create("G", "\\mathbb{G}")), 
    c = new Constant(BigNumber.from(2.99792458) * BigNumber.TEN.pow(8), Symbol.create("c", "\\mathit{c}")), 
    planck = new Constant(BigNumber.from(1.055) * BigNumber.TEN.pow(-34), Symbol.create("h", "\\hbar")), 
    K = new Constant(BigNumber.from(3.9628) * BigNumber.TEN.pow(15), Symbol.create("K", "\\mathcal{K}"));

//symbol
var EVal = new Stat(BigNumber.ZERO, Symbol.create("E", "\\mathbb{E}")), 
    t_r = new Stat(BigNumber.ZERO, Symbol.create("t", "t_r")), 
    t = new Stat(BigNumber.ZERO, Symbol.create("t", "t")), 
    M = new Stat(BigNumber.TEN.pow(10), Symbol.create("M", "\\mathcal{M}")), 
    Cn = new Stat(BigNumber.ZERO, Symbol.create("C_n", "C_n"));

//dynamicLabel
var dynamicLabel1;

var init = () => {
    currency = theory.createCurrency();
    ///////////////////
    // Regular Upgrades

    // startTheory
    {   
        startTheory = theory.createUpgrade(0, currency, new FreeCost());
        startTheory.getDescription = (_) => "Initialize Singularity";
        startTheory.getInfo = (amount) => "Begin the black hole accretion cycle.";
        startTheory.maxLevel = 1;
    }

    // E1
    {
        E1 = theory.createSingularUpgrade(0, currency, new ConstantCost(BigNumber.TEN));
        E1.bought = (amount) => {
            EVal.value += amount * getE(1);
        };
        E1.getDescription = (_) => Utils.getMath(EVal.symbol.latex + " \\uparrow " + getE(1));
        E1.getInfo = (amount) => Utils.getMath(EVal.symbol.latex + "\\text{ increase by }" + getE(1));
    }

    // mi
    {
        mi = new Upgrade(
            theory.createUpgrade(1, currency, new ExponentialCost(BigNumber.FIVE, BigNumber.from(1.18).log2())), 
            new Symbol("mi", "\\mu"), 
            (level) => (BigNumber.TEN.pow(-1) + level * BigNumber.TEN.pow(-2))
        );
    }

    // gamma
    {
        gamma = new Upgrade(
            theory.createUpgrade(2, currency, new ExponentialCost(BigNumber.TEN.pow(2), BigNumber.TEN.pow(2).log2())), 
            new Symbol("gamma", "\\gamma"), 
            (level) => (BigNumber.from(0.9) - level / BigNumber.from(20)).max(BigNumber.from(0.1))
        );
        gamma.upgrade.maxLevel = 16;
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));



    //darkMatter
    darkMatter = theory.createCurrency("Ψ", "\\Psi");
    ///////////////////
    // Regular Upgrades

    //omega
    {
        omega = new Upgrade(
            theory.createUpgrade(3, darkMatter, new LinearCost(BigNumber.ONE, BigNumber.ONE)), 
            new Symbol("omega", "\\omega"), 
            (level) => (BigNumber.ONE + BigNumber.from(0.15) * level)
        );
    }

    /////////////////////
    // Permanent Upgrades

    ///////////////////////
    //// Milestone Upgrades


    updateAvailability();
}

var updateAvailability = () => {
    omega.upgrade.isAvailable = Cn.value > 0;
}

var isCurrencyVisible = (index) => {
    switch (index) {
        case 0:
            return true;
        case 1:
            return omega.upgrade.isAvailable;
        default:
            return false;
    }
}

var tick = (elapsedTime, multiplier) => {
    //calculate
    let realTime = BigNumber.from(elapsedTime * multiplier);
    if (M.value == 0) {
        realTime = 0;
    }
    let time = realTime * TIMEFormula();
    let bonus = theory.publicationMultiplier;

    let P1 = getk() * M.value.pow(2) * (EVal.value + BigNumber.ONE).log10();
    let P2 = BigNumber.from(6.321) * M.value;
    let P_abs = P1.min(P2);
    let E_drained = EVal.value.min(P_abs * time);
    let dE = - E_drained;

    let dM = mi.value * (BigNumber.ONE - gamma.value) * -dE / c.value.pow(2) - time * K.value / (BigNumber.ONE + M.value.pow(2));

    if (startTheory.level > 0) {
        M.value += dM;
        M.value = M.value.max(BigNumber.ZERO);

        EVal.value += dE;

        t.value += time;
        t_r.value += realTime;

        let addCurrency = realTime * M.value / BigNumber.TEN.pow(9);
        if (omega.upgrade.isAvailable) addCurrency *= omega.value.pow(1.25);
        currency.value += addCurrency;
    }

    //dynamicLabel
    if (dynamicLabel1) {
        dynamicLabel1.text = Utils.getMath("\\text{You will earn }" + numberFormat(DMFormula(), 3) + "\\text{ Dark Matter\\\\}")
    }

    theory.invalidateQuaternaryValues();
    theory.invalidateTertiaryEquation();
    updateAvailability();
}

//Equation
var getInternalState = () => `${EVal.value} ${t.value} ${t_r.value} ${M.value} ${Cn.value}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) EVal.value = parseBigNumber(values[0]);
    if (values.length > 1) t.value = parseBigNumber(values[1]);
    if (values.length > 2) t_r.value = parseBigNumber(values[2]);
    if (values.length > 3) M.value = parseBigNumber(values[3]);
    if (values.length > 4) Cn.value = parseBigNumber(values[4]);
}

var getPrimaryEquation = () => {
    let result = "";
    let scale = 1.1;
    let Epsi = getEpsilon();
    result += "\\dot{" + currency.symbol + "} = \\frac{";
    if (omega.upgrade.isAvailable) result += omega.symbol.latex + "^{1.25} \\cdot";
    result += M.symbol.latex + "}{10^{9}} \\\\\\\\";

    result += "d" + t.symbol.latex + " = \\sqrt{1 + " + Epsi.symbol.latex + "} \\\\\\\\";

    result += "\\frac{d" + EVal.symbol.latex + "}{d" + t.symbol.latex + "} = -\\min\\left(" + EVal.symbol.latex + ",P_{abs}\\right) \\\\\\\\";

    result += "\\frac{d" + M.symbol.latex + "}{d" + t.symbol.latex + "} = -\\frac{d" + EVal.symbol.latex + "}{d" + t.symbol.latex + "} \\cdot \\frac{" + mi.symbol.latex + " (1 - " + gamma.symbol.latex + ")}{" + c.symbol.latex + "^2} - \\frac{" + K.symbol.latex + "}{" + M.symbol.latex + "^2 + 1}";

    theory.primaryEquationScale = scale;
    theory.primaryEquationHeight = 150 * scale;
    return "\\begin{matrix}" + result + "\\end{matrix}";
}

var getQuaternaryEntries = () => {
    let quaternaryEntries = [];
    let flagAll = quaternaryEntries.length == 0;
    let Epsi = getEpsilon();
    if (flagAll) {
        quaternaryEntries.push(new QuaternaryEntry(EVal.symbol.latex, null));
        quaternaryEntries.push(new QuaternaryEntry(M.symbol.latex, null));
        quaternaryEntries.push(new QuaternaryEntry("r_s", null));
        quaternaryEntries.push(new QuaternaryEntry(Epsi.symbol.latex, null));
        quaternaryEntries.push(new QuaternaryEntry(t.symbol.latex, null));
        quaternaryEntries.push(new QuaternaryEntry(t_r.symbol.latex, null));
    }
    quaternaryEntries[0].value = numberFormat(EVal.value, 2);
    quaternaryEntries[1].value = numberFormat(M.value, 2);
    quaternaryEntries[2].value = numberFormat(getSchRadius(), 2);
    quaternaryEntries[3].value = numberFormat(Epsi.value, 2);
    quaternaryEntries[4].value = numberFormat(t.value, 2);
    quaternaryEntries[5].value = numberFormat(t_r.value, 2);
    return quaternaryEntries;
}

var getTertiaryEquation = () => {
    let result = "";
    let tEvap = M.value.pow(BigNumber.THREE) / (BigNumber.THREE * K.value);
    result += "T_{evap} = " + numberFormat(tEvap / TIMEFormula(), 2);
    result += ",\\text{ }r - r_s = " + numberFormat(getRadiusDiff(), 2);
    return result;
}

var getSecondaryEquation = () => {
    let result = "";
    let Epsi = getEpsilon();
    result += theory.latexSymbol + "=\\max\\rho";
    result += ",\\text{ }" + Epsi.symbol.latex + " = \\frac{r_s}{r - r_s}";
    return result;
}

var getEquationOverlay = () => {
    //question
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
                                    text: Utils.getMath("P_1 = " + numberFormat(getk(), 1) + " \\cdot " + M.symbol.latex + "^2 \\cdot log_{10}\\left(1 + " + EVal.symbol.latex + "\\right)"),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath("P_2 = 6.321 " + M.symbol.latex),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath("P_{\\text{abs}} = \\min\\left(P_1, P_2\\right)"),
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
                                    text: Utils.getMath(G.symbol.latex + " = " + numberFormat(G.value, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath(c.symbol.latex + " = " + numberFormat(c.value, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath(planck.symbol.latex + " = " + numberFormat(planck.value, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath(K.symbol.latex + " = " + numberFormat(K.value, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                })
                            ]
                        })
                    });
            popup.show();
        },
    });

    //collapse
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
            let isReady = M.value.toNumber() == 0; 
        
            let colapText = isReady ? "Collapse!" : "You need to achieve a value of 0 for M.";
            let colapFontSize = isReady ? 20 : 15;

            button2.textColor = Color.TEXT;

            dynamicLabel1 = ui.createLatexLabel({
                horizontalTextAlignment: TextAlignment.CENTER,
                verticalTextAlignment: TextAlignment.CENTER
            });
            
            let popup = ui.createPopup({
                        title: "Collapse",
                        content: ui.createStackLayout({
                            children: [
                                ui.createLatexLabel({
                                    text: Utils.getMath("\\text{Reset your {" + currency.symbol + "}, {" + M.symbol.latex + "}, {" + EVal.symbol.latex + "}, {" + t.symbol.latex + "}, {" + t_r.symbol.latex + "}\\\\ and {" + mi.symbol.latex + "}, {" + gamma.symbol.latex + "} upgrade\\\\}"),
                                    horizontalTextAlignment: TextAlignment.CENTER,
                                    verticalTextAlignment: TextAlignment.CENTER
                                }),
                                dynamicLabel1,
                                ui.createButton({
                                    text: colapText,
                                    fontSize: colapFontSize,
                                    heightRequest: 35,
                                    onReleased: () => {
                                        if (isReady) {
                                            collapseReset();
                                            popup.hide(); // Tự động đóng popup sau khi reset thành công
                                        }
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
var get2DGraphValue = () => M.value.toNumber();


//reset_layer
var collapseReset = () => {
    Cn.value++;
    darkMatter.value += DMFormula();
    currency.value = BigNumber.ZERO;
    startTheory.level = 0;
    M.reset();
    EVal.reset();
    t.reset();
    t_r.reset();
    mi.reset();
    gamma.reset();
    theory.clearGraph();
    theory.invalidatePrimaryEquation();
    theory.invalidateQuaternaryValues();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
}


//formula
var DMFormula = () => {
    return t_r.value / BigNumber.from(90);
}

var TIMEFormula = () => {
    let Epsi = getEpsilon();
    return (BigNumber.ONE + Epsi.value).sqrt();
}


//getValue
var getE = (amount) => {
    return amount * BigNumber.TEN.pow(22);
}

var getk = () => {
    return BigNumber.TEN.pow(-1);
}

var getSchRadius = () => {
    return BigNumber.TWO * G.value * M.value / c.value.pow(2);
}

var getRadiusDiff = () => {
    let save = BigNumber.from(1.5) * BigNumber.TEN.pow(-51);
    return BigNumber.from(1.5) * BigNumber.TEN.pow(-41);
}

var getEpsilon = () => {
    return new Constant(getSchRadius() / getRadiusDiff(), Symbol.create("ε", "\\epsilon"));
}


//support_function
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

init();

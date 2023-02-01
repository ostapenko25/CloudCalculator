Chart.register(ChartDataLabels);

//Get input range value
function getInputRangeValue(input, inputValue) {
    const storage_value = document.querySelector(inputValue)
    const storage = document.querySelector(input)
    storage_value.textContent = storage.value
    storage.addEventListener("input", (event) => {
        storage_value.textContent = event.target.value
    })
};
getInputRangeValue("#storage", "#storage_value");
getInputRangeValue("#transfer", "#transfer_value")

let provider2StorageType = "hdd";
let provider3StorageType = "multi";
let indexAxisResponsive = $(window).width() <= 768 ? "x" : "y";

//Create Chart.js Bar 
var ctx = document.getElementById("Chart1");
var myChart = new Chart(ctx, {
    onrendered: function () { changeTickLabel() },
    type: 'bar',
    data: {
        labels: [""],
        datasets: [
            {
                data: [15],
                label: "Backblaze.com",
                backgroundColor: "lightgrey",
                barPercentage: 1,
            },
            {
                data: [10],
                label: "Bunny.com",
                backgroundColor: "orange",
                barPercentage: 1,
            },
            {
                data: [74],
                label: "Scaleway.com",
                backgroundColor: "lightgrey",
                barPercentage: 1,
            },
            {
                data: [18],
                label: "Vultr.com",
                backgroundColor: "lightgrey",
                barPercentage: 1,
            }],
    },
    options: {
        responsive: true,
        legend: {
            display: false
        },
        tooltips: {
            callbacks: {
                label: function (tooltipItem) {
                    return tooltipItem.yLabel;
                }
            }
        },
        scales: {
            x: {
                border: {
                    display: false
                },
                grid: {
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                },
                ticks: {
                    display: false,
                },

            },
            y: {
                border: {
                    display: false
                },
                grid: {
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                },
                ticks: {
                    display: false
                },

            }
        },
        indexAxis: indexAxisResponsive,
        elements: {
            bar: {
                borderWidth: 2,
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            datalabels: {
                anchor: 'right',
                align: 'end',
                formatter: function (value) {
                    return value + '$';
                },
                font: {
                    weight: 'bold',
                    size: "20px"
                },
                labels: {
                    value: {},
                    title: {
                        color: 'black'
                    }
                },
            }

        },
    },

});

//Set bar data
function graphMe() {

    const storage = parseInt(document.getElementById("storage").value);
    const transfer = parseInt(document.getElementById("transfer").value);
    const Provider1 = myChart.data.datasets[0];
    const Provider2 = myChart.data.datasets[1];
    const Provider3 = myChart.data.datasets[2];
    const Provider4 = myChart.data.datasets[3];

    //Provider 1, Provider 4
    function getRateWithMin(storageRate, transferRate, minRate) {
        let costStorageProvider = storage * storageRate;
        let costTransferProvider = transfer * transferRate;
        let costProvider = costStorageProvider + costTransferProvider;
        costStorageProvider === 0 && costTransferProvider === 0 
            ? minRate = 0 
            : minRate;
        costProvider = costProvider < minRate
            ? minRate 
            : (costStorageProvider + costTransferProvider);
        return costProvider.toFixed(2);
    }

    //Provider 2
    function getRateWithMax(transferRate, maxRate) {
        provider2StorageType = document.querySelector('input[name="provider2_storage_type"]:checked').value;
        let storageRate;
        provider2StorageType === "hdd"
            ? storageRate = providerData[1].storageRateHDD
            : storageRate = providerData[1].storageRateSSD
        let costStorageProvider = storage * storageRate;
        let costTransferProvider = transfer * transferRate;
        let costProvider = (costStorageProvider + costTransferProvider);
        costProvider = costProvider > maxRate ? maxRate : (costStorageProvider + costTransferProvider);
        return costProvider.toFixed(2);
    }

    //Provider 3
    function getRateWithFreeSpace(storageRateMulti, storageRateSingle, transferRate) {

        let provider3StorageType = document.querySelector('input[name="provider3_storage_type"]:checked').value;
        let storageAfterFreeSpace;
        let transferAfterFreeSpace;
        let storageRateAfterFreeSpace;
        let transferRateAfterFreeSpace;
        let costStorageProvider;
        let costTransferProvider;

        if (storage > providerData[2].freeSpace) {
            storageAfterFreeSpace = (storage - providerData[2].freeSpace);
            storageRateAfterFreeSpace = provider3StorageType === "multi"
                ? storageRateMulti 
                : storageRateSingle;
            costStorageProvider = storageAfterFreeSpace * storageRateAfterFreeSpace;
        } else {
            costStorageProvider = 0
        }

        if (transfer > providerData[2].freeSpace) {
            transferAfterFreeSpace = transfer - providerData[2].freeSpace
            transferRateAfterFreeSpace = transferRate
            costTransferProvider = transferAfterFreeSpace * transferRateAfterFreeSpace;
        } else {
            costTransferProvider = 0
        }
        const costProvider = costStorageProvider + costTransferProvider;
        return costProvider.toFixed(2);
    }

    //Set Bar data values
    Provider1.data[0] = getRateWithMin(
        providerData[0].storageRate,
        providerData[0].transferRate,
        providerData[0].minRate
    );
    Provider2.data[0] = getRateWithMax(
        providerData[1].transferRate,
        providerData[1].maxRate
    );
    Provider3.data[0] = getRateWithFreeSpace(
        providerData[2].storageRateMulti,
        providerData[2].storageRateSingle,
        providerData[2].transferRate
    );
    Provider4.data[0] = getRateWithMin(
        providerData[3].storageRate,
        providerData[3].transferRate,
        providerData[3].minRate
    );

    //Set color for minimum value bar
    function setMinimumValueBarColor() {
        let barValues = [
            parseFloat(Provider1.data[0]),
            parseFloat(Provider2.data[0]),
            parseFloat(Provider3.data[0]),
            parseFloat(Provider4.data[0]),
        ];
        let minBarValue = Math.min.apply(null, barValues);

        for (i in myChart.data.datasets) {
            let barValue = myChart.data.datasets[i].data[0];
            barValue == minBarValue
                ? myChart.data.datasets[i].backgroundColor = providerData[i].color
                : myChart.data.datasets[i].backgroundColor = "lightgrey";
        };
    }
    setMinimumValueBarColor();

    //Update Chart
    myChart.update();

}


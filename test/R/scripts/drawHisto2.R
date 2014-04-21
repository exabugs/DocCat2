args <- commandArgs(trailingOnly = T)
infile <- args[1]
outfile <- args[2]

data <- read.csv(infile, row.names = 1)
pdf(outfile)
hist(data$x)
dev.off()

#
# http://mjin.doshisha.ac.jp/R/27/27.html
# >(eur.cmd<-cmdscale(eurodist))
# >plot(eur.cmd,type="n")
# >text(eur.cmd,rownames(eur.cmd ))

tourism <- read.table("a.csv", header=T, sep="\t", row.names=1)
tourism.dist <- as.dist(tourism)
tourism.cmd<-cmdscale(tourism)

data <- as.matrix(tourism)


data <- read.table("b.csv", header=T, sep="\t", row.names=1)
data.dist = dist(data)

data.cmd = cmdscale(data.dist)
plot(data.cmd, xlim=c(-15,15), ylim=c(-15,15))
text(data.cmd +1,rownames(data.cmd))
write(t(data.cmd), "/tmp/data.cmd", ncolumn=2)



library(MASS)
data <- read.table("a.csv", header=T, sep="\t", row.names=1)
data.dist = dist(data)
data.cmd = isoMDS(data.dist)$points
plot(data.cmd, type="n", xlim=c(-40,40), ylim=c(-40,40))
text(data.cmd, rownames(data.cmd))

data <- read.table("a.csv", header=T, sep="\t", row.names=1)
data.dist = dist(data)
data.cmd = sammon(data.dist)$points
plot(data.cmd, type="n", xlim=c(-40,40), ylim=c(-40,40))
text(data.cmd, rownames(data.cmd))



# いい！
# [連載]フリーソフトによるデータ解析・マイニング第61回
# http://mjin.doshisha.ac.jp/R/61/61.html

# 無効グラフ
# http://www.okada.jp.org/RWiki/?R%20%A4%C7%A5%B0%A5%E9%A5%D5%CD%FD%CF%C0


        toyota  mazda   nissan  honda   subaru
toyota  10
mazda   1       10
nissan  6       2       10
honda   3       3       4       10
subaru  5       3       4       3       10



data <- read.table("b.csv", header=T, sep="\t", row.names=1)
data = 10 - data
data.dist = dist(data)

data.cmd = cmdscale(data.dist)
plot(data.cmd, xlim=c(-15,15), ylim=c(-15,15))
text(data.cmd +1,rownames(data.cmd))
write(t(data.cmd), "/tmp/data.cmd", ncolumn=2)



